App({
  onLaunch() {
    console.log('小程序启动')
  },
  
  globalData: {
    userInfo: null,
    hasLogin: false,
    autoGenerateReview: true // 默认开启自动生成复习任务
  }
})
