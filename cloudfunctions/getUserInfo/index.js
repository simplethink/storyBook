// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 获取用户信息并保存到云端
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  try {
    // 检查用户是否已存在
    const userResult = await db.collection('users').where({
      openid: openid
    }).get()
    
    if (userResult.data.length > 0) {
      // 用户已存在，更新信息
      const updateTime = Date.now()
      await db.collection('users').doc(userResult.data[0]._id).update({
        data: {
          nickName: event.nickName,
          avatarUrl: event.avatarUrl,
          gender: event.gender || 0,
          city: event.city || '',
          province: event.province || '',
          country: event.country || '',
          updateTime: updateTime
        }
      })
      
      return {
        success: true,
        message: '用户信息更新成功',
        data: {
          openid: openid,
          nickName: event.nickName,
          avatarUrl: event.avatarUrl
        }
      }
    } else {
      // 新用户，创建记录
      const createTime = Date.now()
      const result = await db.collection('users').add({
        data: {
          openid: openid,
          nickName: event.nickName,
          avatarUrl: event.avatarUrl,
          gender: event.gender || 0,
          city: event.city || '',
          province: event.province || '',
          country: event.country || '',
          createTime: createTime,
          updateTime: createTime
        }
      })
      
      return {
        success: true,
        message: '用户信息创建成功',
        data: {
          openid: openid,
          nickName: event.nickName,
          avatarUrl: event.avatarUrl
        }
      }
    }
  } catch (err) {
    console.error('保存用户信息失败:', err)
    return {
      success: false,
      errMsg: err.message
    }
  }
}
