// pages/settings/settings.js
const app = getApp()

Page({
  data: {
    autoGenerateReview: true
  },

  onLoad() {
    // 从本地存储加载设置，如果没有则使用全局默认值
    const savedSetting = wx.getStorageSync('autoGenerateReview')
    this.setData({
      autoGenerateReview: savedSetting !== '' ? savedSetting : app.globalData.autoGenerateReview
    })
  },

  // 切换自动生成复习任务开关
  onToggleAutoGenerate(e) {
    const enabled = e.detail.value
    this.setData({
      autoGenerateReview: enabled
    })
    
    // 保存到本地存储
    wx.setStorageSync('autoGenerateReview', enabled)
    
    // 更新全局变量
    app.globalData.autoGenerateReview = enabled
    
    wx.showToast({
      title: enabled ? '已开启自动生成' : '已关闭自动生成',
      icon: 'success'
    })
  }
})
