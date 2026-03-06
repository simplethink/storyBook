const util = require('../../utils/util.js')

Page({
  data: {
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
    this.loadTodayData()
    this.loadStats()
    this.loadRecentRecords()
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
  }
})
