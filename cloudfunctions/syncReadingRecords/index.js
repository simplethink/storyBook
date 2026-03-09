// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 同步读书记录到云端
 * event.action: 'upload' | 'download' | 'batchUpload'
 * event.records: 记录数组（上传时）
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  try {
    // 上传本地记录到云端
    if (event.action === 'upload' || event.action === 'batchUpload') {
      const records = event.records || []
      const uploadedRecords = []
      
      for (const record of records) {
        // 检查记录是否已存在
        const existingRecord = await db.collection('reading_records').where({
          openid: openid,
          bookName: record.bookName,
          date: record.date,
          createTime: record.createTime
        }).get()
        
        if (existingRecord.data.length > 0) {
          // 更新现有记录
          await db.collection('reading_records').doc(existingRecord.data[0]._id).update({
            data: record
          })
          uploadedRecords.push(record)
        } else {
          // 添加新记录
          const newRecord = {
            ...record,
            openid: openid,
            createTime: record.createTime || Date.now()
          }
          const result = await db.collection('reading_records').add({
            data: newRecord
          })
          uploadedRecords.push({ ...record, _id: result._id })
        }
      }
      
      return {
        success: true,
        message: `成功同步 ${uploadedRecords.length} 条记录`,
        data: uploadedRecords
      }
    }
    
    // 从云端下载记录
    if (event.action === 'download') {
      let query = db.collection('reading_records').where({
        openid: openid
      })
      
      // 如果指定了日期范围，则过滤
      if (event.startDate) {
        query = query.where({
          date: db.command.gte(event.startDate)
        })
      }
      if (event.endDate) {
        query = query.where({
          date: db.command.lte(event.endDate)
        })
      }
      
      // 按时间倒序排序
      const result = await query.orderBy('createTime', 'desc').get()
      
      return {
        success: true,
        data: result.data,
        total: result.data.length
      }
    }
    
    // 删除记录
    if (event.action === 'delete') {
      if (!event.recordId) {
        return {
          success: false,
          errMsg: '缺少 recordId 参数'
        }
      }
      
      await db.collection('reading_records').doc(event.recordId).remove()
      
      return {
        success: true,
        message: '删除成功'
      }
    }
    
    return {
      success: false,
      errMsg: '未知的 action 类型'
    }
  } catch (err) {
    console.error('同步读书记录失败:', err)
    return {
      success: false,
      errMsg: err.message
    }
  }
}
