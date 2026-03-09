// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 同步复习任务到云端
 * event.action: 'upload' | 'download' | 'update' | 'delete'
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  try {
    // 上传本地任务到云端
    if (event.action === 'upload' || event.action === 'batchUpload') {
      const tasks = event.tasks || []
      const uploadedTasks = []
      
      for (const task of tasks) {
        // 检查任务是否已存在
        const existingTask = await db.collection('review_tasks').where({
          openid: openid,
          bookName: task.bookName,
          readDate: task.readDate,
          reviewDate: task.reviewDate,
          stage: task.stage
        }).get()
        
        if (existingTask.data.length > 0) {
          // 更新现有任务
          await db.collection('review_tasks').doc(existingTask.data[0]._id).update({
            data: task
          })
          uploadedTasks.push(task)
        } else {
          // 添加新任务
          const newTask = {
            ...task,
            openid: openid,
            createTime: task.createTime || Date.now()
          }
          const result = await db.collection('review_tasks').add({
            data: newTask
          })
          uploadedTasks.push({ ...task, _id: result._id })
        }
      }
      
      return {
        success: true,
        message: `成功同步 ${uploadedTasks.length} 个任务`,
        data: uploadedTasks
      }
    }
    
    // 从云端下载任务
    if (event.action === 'download') {
      let query = db.collection('review_tasks').where({
        openid: openid
      })
      
      // 如果指定了日期范围，则过滤
      if (event.startDate) {
        query = query.where({
          reviewDate: db.command.gte(event.startDate)
        })
      }
      if (event.endDate) {
        query = query.where({
          reviewDate: db.command.lte(event.endDate)
        })
      }
      
      // 按复习日期排序
      const result = await query.orderBy('reviewDate', 'asc').get()
      
      return {
        success: true,
        data: result.data,
        total: result.data.length
      }
    }
    
    // 更新任务状态（完成复习）
    if (event.action === 'update') {
      if (!event.taskId) {
        return {
          success: false,
          errMsg: '缺少 taskId 参数'
        }
      }
      
      const updateData = {
        completed: event.completed !== undefined ? event.completed : false,
        completedTime: event.completedTime || (event.completed ? Date.now() : null),
        updateTime: Date.now()
      }
      
      await db.collection('review_tasks').doc(event.taskId).update({
        data: updateData
      })
      
      return {
        success: true,
        message: '更新成功'
      }
    }
    
    // 删除任务
    if (event.action === 'delete') {
      if (!event.taskId) {
        return {
          success: false,
          errMsg: '缺少 taskId 参数'
        }
      }
      
      await db.collection('review_tasks').doc(event.taskId).remove()
      
      return {
        success: true,
        message: '删除成功'
      }
    }
    
    // 批量生成复习任务（根据艾宾浩斯曲线）
    if (event.action === 'generateReviews') {
      const readRecord = event.readRecord
      if (!readRecord) {
        return {
          success: false,
          errMsg: '缺少 readRecord 参数'
        }
      }
      
      // 艾宾浩斯复习周期：1 天、2 天、4 天、7 天、15 天
      const reviewCycles = [1, 2, 4, 7, 15]
      const readDate = new Date(readRecord.date)
      const generatedTasks = []
      
      for (let i = 0; i < reviewCycles.length; i++) {
        const reviewDate = new Date(readDate)
        reviewDate.setDate(reviewDate.getDate() + reviewCycles[i])
        
        const newTask = {
          openid: openid,
          bookName: readRecord.bookName,
          author: readRecord.author || '',
          readDate: readRecord.date,
          reviewDate: reviewDate.toDateString(),
          stage: i + 1,
          completed: false,
          completedTime: null,
          createTime: Date.now()
        }
        
        const result = await db.collection('review_tasks').add({
          data: newTask
        })
        
        generatedTasks.push({ ...newTask, _id: result._id })
      }
      
      return {
        success: true,
        message: `成功生成 ${generatedTasks.length} 个复习任务`,
        data: generatedTasks
      }
    }
    
    return {
      success: false,
      errMsg: '未知的 action 类型'
    }
  } catch (err) {
    console.error('同步复习任务失败:', err)
    return {
      success: false,
      errMsg: err.message
    }
  }
}
