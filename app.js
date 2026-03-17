App({
  onLaunch() {
    console.log('小程序启动')
    
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-0gu9re7s846e6224', // 使用用户的环境 ID
        traceUser: true,
      })
    }
    
    // 获取用户 openid
    this.getOpenid()
  },
  
  globalData: {
    userInfo: null,
    hasLogin: false,
    autoGenerateReview: true, // 默认开启自动生成复习任务
    openid: null // 存储用户 openid
  },
  
  // 获取 openid
  getOpenid() {
    const that = this
    
    // 先检查缓存
    const cachedOpenid = wx.getStorageSync('openid')
    if (cachedOpenid) {
      console.log('从缓存获取 openid:', cachedOpenid)
      that.globalData.openid = cachedOpenid
      return Promise.resolve(cachedOpenid)
    }
    
    // 调用云函数获取 openid
    return wx.cloud.callFunction({
      name: 'getOpenid',
      data: {}
    }).then(res => {
      console.log('云函数获取 openid 成功:', res.result)
      const openid = res.result.openid
      that.globalData.openid = openid
      
      // 缓存 openid
      wx.setStorageSync('openid', openid)
      
      return openid
    }).catch(err => {
      console.error('云函数获取 openid 失败:', err)
      return Promise.reject(err)
    })
  }
})
