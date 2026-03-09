// pages/login/login.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    hasUserInfo: false
  },

  onLoad() {
    // 检查是否已经登录
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
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
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})
