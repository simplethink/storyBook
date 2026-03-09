// pages/login/login.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    hasUserInfo: false
  },

  onLoad() {
    console.log('登录页面 onLoad')
    // 检查是否已经登录
    if (app.globalData.userInfo && app.globalData.hasLogin) {
      console.log('用户已登录，自动跳转首页')
      // 延迟一下，确保页面渲染完成
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/index/index',
          fail: (err) => {
            console.error('跳转首页失败:', err)
          }
        })
      }, 500)
    }
  },

  // 获取用户信息
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const userInfo = res.userInfo
        console.log('获取到用户信息:', userInfo)
        
        this.setData({
          userInfo: userInfo,
          hasUserInfo: true
        })
        
        // 保存到全局
        app.globalData.userInfo = userInfo
        app.globalData.hasLogin = true
        
        // 保存到本地
        wx.setStorageSync('userInfo', userInfo)
        
        // 调用云函数保存到云端
        wx.cloud.callFunction({
          name: 'getUserInfo',
          data: {
            nickName: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl,
            gender: userInfo.gender,
            city: userInfo.city,
            province: userInfo.province,
            country: userInfo.country
          },
          success: (cloudRes) => {
            console.log('云函数保存用户信息成功:', cloudRes.result)
            if (cloudRes.result.success) {
              wx.showToast({
                title: '登录成功',
                icon: 'success'
              })
            }
          },
          fail: (err) => {
            console.error('云函数保存用户信息失败:', err)
          }
        })
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err)
        wx.showToast({
          title: '授权失败，请重新尝试',
          icon: 'none'
        })
      }
    })
  },

  // 进入首页
  enterHome() {
    console.log('点击进入首页')
    wx.navigateTo({
      url: '/pages/index/index'
    })
  },
  
  // 跳转到日历页面
  goToCalendar() {
    console.log('跳转到阅读日历')
    // 如果未登录，提示先登录
    if (!this.data.hasUserInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: '/pages/calendar/calendar'
    })
  },
  
  // 跳转到复习任务页面
  goToReviewTasks() {
    console.log('跳转到复习提醒')
    // 如果未登录，提示先登录
    if (!this.data.hasUserInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    const today = new Date().toDateString()
    wx.navigateTo({
      url: `/pages/recordDetail/recordDetail?date=${encodeURIComponent(today)}`
    })
  },
  
  // 查看统计（通过首页查看）
  goToStats() {
    console.log('跳转到数据统计')
    // 如果未登录，提示先登录
    if (!this.data.hasUserInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    // 统计信息在首页显示，所以跳转到首页
    wx.navigateTo({
      url: '/pages/index/index'
    })
  }
})
