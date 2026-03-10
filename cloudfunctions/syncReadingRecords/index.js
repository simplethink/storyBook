// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 同步读书记录到云端
 * event.action: 'add' | 'update' | 'download' | 'delete'
 * event.records: 记录数组（上传时）
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  try {
    // 新增记录
    if (event.action === 'add') {
     const records = event.records || []
     const addedRecords = []
      
      for (const record of records) {
        // 检查记录是否已存在
       const existingRecord = await db.collection('reading_records').where({
          openid: openid,
         bookName: record.bookName,
         date: record.date,
          createTime: record.createTime
        }).get()
        
        if (existingRecord.data.length > 0) {
         console.log('记录已存在，跳过:', record.bookName)
         addedRecords.push(record)
        } else {
          // 添加新记录
         const newRecord= {
            ...record,
            openid: openid,
            createTime: record.createTime || Date.now()
          }
         const result = await db.collection('reading_records').add({
           data: newRecord
          })
         addedRecords.push({ ...record, _id: result._id })
        }
      }
      
      return {
        success: true,
        message: `成功新增 ${addedRecords.length} 条记录`,
       data: addedRecords
      }
    }
    
    // 更新记录
    if (event.action === 'update') {
     const records = event.records || []
     const updatedRecords = []
      
      for (const record of records) {
        // 根据 id 查找并更新
       const existingRecord = await db.collection('reading_records').where({
          openid: openid,
          id: record.id
        }).get()
        
        if (existingRecord.data.length > 0) {
          // 更新现有记录
          await db.collection('reading_records').doc(existingRecord.data[0]._id).update({
           data: {
              ...record,
              updateTime: Date.now()
            }
          })
          updatedRecords.push(record)
        } else {
         console.log('记录不存在，无法更新:', record.id)
        }
      }
      
      return {
        success: true,
        message: `成功更新 ${updatedRecords.length} 条记录`,
       data: updatedRecords
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
