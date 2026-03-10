const util = require('../../utils/util.js')

Page({
  data: {
    userInfo: null,
    hasLogin: false,
    stats: {
      totalBooks: 0,
      totalDays: 0,
      pendingReviews: 0
    },
    todayRecords: [],
    todayReviewTasks: [],
    recentRecords: []
  },

  onLoad() {
    // 获取用户信息
    this.loadUserInfo()
    
    // 从云端同步数据（如果有网络）
    this.syncDataFromCloud()
    
    this.loadTodayData()
    this.loadStats()
    this.loadRecentRecords()
  },
  
  // 加载用户信息
  loadUserInfo() {
    const app = getApp()
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasLogin: app.globalData.hasLogin
      })
    } else {
      // 尝试从云函数获取
      app.getUserInfo((userInfo) => {
        if (userInfo) {
          this.setData({
            userInfo: userInfo,
            hasLogin: true
          })
        }
      })
    }
  },
  
  // 从云端同步数据
  syncDataFromCloud() {
    const app = getApp()
    
    // 检查是否已登录
    if (!app.globalData.hasLogin) {
      console.log('未登录，跳过云端同步')
      return
    }
    
    wx.showLoading({ title: '同步数据中...' })
    
    // 下载读书记录
    app.downloadReadingRecords(null, null, (readResult) => {
      if (readResult.success) {
        console.log('读书记录同步成功', readResult.data)
        // 重新加载本地数据（因为已经合并到本地了）
        this.loadTodayData()
        this.loadStats()
        this.loadRecentRecords()
      }
      
      // 下载复习任务
      app.downloadReviewTasks(null, null, (taskResult) => {
        wx.hideLoading()
        
        if (taskResult.success) {
          console.log('复习任务同步成功', taskResult.data)
          // 重新加载本地数据
          this.loadTodayData()
          this.loadStats()
        } else {
          console.log('复习任务同步失败或无需同步')
        }
        
        // 显示同步结果提示
        if (readResult.success || taskResult.success) {
          // wx.showToast({
          //   title: '数据同步完成',
          //   icon: 'success',
          //   duration: 1500
          // })
        }
      })
    })
  },

  // 加载今天的数据（读书和复习任务）
  loadTodayData() {
    const allRecords = wx.getStorageSync('readingRecords') || {}
    const allTasks = wx.getStorageSync('reviewTasks') || {}
    const today = new Date().toDateString()
    
    // 获取今天的阅读记录
    const todayRecords = allRecords[today] || []
    
    // 获取今天的复习任务
    const todayTasks = allTasks[today] || []
    const pendingReviews = todayTasks.filter(t => !t.completed)
    
    this.setData({
      todayRecords,
      todayReviewTasks: pendingReviews
    })
  },

  // 加载统计数据
  loadStats() {
    const allRecords = wx.getStorageSync('readingRecords') || {}
    const allTasks = wx.getStorageSync('reviewTasks') || {}
    
    // 统计书籍数量
    let bookSet = new Set()
    let dateSet = new Set()
    
    Object.keys(allRecords).forEach(date => {
      const records = allRecords[date] || []
      if (records.length > 0) {
        dateSet.add(date)
        records.forEach(record => {
          if (record.bookName) {
            bookSet.add(record.bookName)
          }
        })
      }
    })
    
    // 统计待复习任务
    let pendingReviews = 0
    const today = new Date().toDateString()
    const todayTasks = allTasks[today] || []
    pendingReviews = todayTasks.filter(t => !t.completed).length
    
    this.setData({
      'stats.totalBooks': bookSet.size,
      'stats.totalDays': dateSet.size,
      'stats.pendingReviews': pendingReviews
    })
  },

  // 加载最近记录
  loadRecentRecords() {
    const allRecords = wx.getStorageSync('readingRecords') || {}
    const records = []
    
    // 获取所有记录并排序
    Object.keys(allRecords).forEach(date => {
      const dayRecords = allRecords[date] || []
      dayRecords.forEach(record => {
        records.push({
          ...record,
          dateStr: util.formatDate(date)
        })
      })
    })
    
    // 按时间倒序排序，取前 5 条
    records.sort((a, b) => b.createTime - a.createTime)
    this.setData({
      recentRecords: records.slice(0, 5)
    })
  },

  // 跳转到日历
  goToCalendar() {
    wx.navigateTo({
      url: '/pages/calendar/calendar'
    })
  },

  // 添加记录
  addRecord() {
    const today = new Date().toDateString()
    wx.navigateTo({
      url: `/pages/editRecord/editRecord?date=${encodeURIComponent(today)}`
    })
  },

  // 查看复习任务
  viewReviewTasks() {
    const today = new Date().toDateString()
    wx.navigateTo({
      url: `/pages/recordDetail/recordDetail?date=${encodeURIComponent(today)}`
    })
  },

  // 搜索图书
  searchBook() {
    wx.showModal({
      title: '提示',
      content: '扫码或拍照功能可在添加记录页面使用',
      showCancel: false
    })
  },

  // 跳转到设置页面
  goToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  },

  // 查看今日读书详情
  viewTodayBooks() {
    const today = new Date().toDateString()
    wx.navigateTo({
      url: `/pages/recordDetail/recordDetail?date=${encodeURIComponent(today)}`
    })
  },

  // 查看今日复习详情
  viewTodayReview() {
    const today = new Date().toDateString()
    wx.navigateTo({
      url: `/pages/recordDetail/recordDetail?date=${encodeURIComponent(today)}`
    })
  },

  // 查看全部记录
  viewAllRecords() {
    wx.navigateTo({
      url: '/pages/calendar/calendar'
    })
  },

  // 查看记录详情
  viewRecordDetail(e) {
    const record = e.currentTarget.dataset.record
    wx.navigateTo({
      url: `/pages/viewRecord/viewRecord?record=${encodeURIComponent(JSON.stringify(record))}`
    })
  },

  onShow() {
    this.loadTodayData()
    this.loadStats()
    this.loadRecentRecords()
    // 每次打开页面时也同步一次
    this.syncDataFromCloud()
  }
})
