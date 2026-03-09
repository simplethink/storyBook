// pages/calendar/calendar.js
const app = getApp()

Page({
  data: {
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth(),
    today: new Date().toDateString(),
    selectedDate: new Date().toDateString(),
    daysArray: [],
    records: {}, // 存储每天的阅读记录
    reviewTasks: {} // 存储复习任务
  },

  onLoad(options) {
    this.generateCalendarDays()
    this.loadRecords()
    this.loadReviewTasks()
  },

  // 生成日历天数
  generateCalendarDays() {
    const year = this.data.currentYear
    const month = this.data.currentMonth
    
    // 获取当月第一天是星期几
    const firstDay = new Date(year, month, 1).getDay()
    // 获取当月总天数
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    // 获取上月总天数
    const prevMonthDays = new Date(year, month, 0).getDate()
    
    const daysArray = []
    
    // 添加上月的日期
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i
      const date = new Date(year, month - 1, day).toDateString()
      daysArray.push({
        day,
        date,
        isCurrentMonth: false,
        isToday: date === this.data.today,
        isSelected: date === this.data.selectedDate,
        hasRecord: !!this.data.records[date],
        hasReviewTask: !!this.data.reviewTasks[date]
      })
    }
    
    // 添加当月的日期
    const today = new Date().toDateString()
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i).toDateString()
      daysArray.push({
        day: i,
        date,
        isCurrentMonth: true,
        isToday: date === today,
        isSelected: date === this.data.selectedDate,
        hasRecord: !!this.data.records[date],
        hasReviewTask: !!this.data.reviewTasks[date]
      })
    }
    
    // 添加下月的日期（补齐 42 个格子）
    const remaining = 42 - daysArray.length
    for (let i = 1; i <= remaining; i++) {
      const day = i
      const date = new Date(year, month + 1, day).toDateString()
      daysArray.push({
        day,
        date,
        isCurrentMonth: false,
        isToday: date === this.data.today,
        isSelected: date === this.data.selectedDate,
        hasRecord: !!this.data.records[date],
        hasReviewTask: !!this.data.reviewTasks[date]
      })
    }
    
    this.setData({ daysArray })
  },

  // 切换月份
  prevMonth() {
    let { currentYear, currentMonth } = this.data
    if (currentMonth === 0) {
      currentYear--
      currentMonth = 11
    } else {
      currentMonth--
    }
    this.setData({ currentYear, currentMonth }, () => {
      this.generateCalendarDays()
    })
  },

  nextMonth() {
    let { currentYear, currentMonth } = this.data
    if (currentMonth === 11) {
      currentYear++
      currentMonth = 0
    } else {
      currentMonth++
    }
    this.setData({ currentYear, currentMonth }, () => {
      this.generateCalendarDays()
    })
  },

  // 点击日期
  onDayTap(e) {
    const { date } = e.currentTarget.dataset
    this.setData({ selectedDate: date }, () => {
      this.generateCalendarDays()
      this.viewDayRecords(date)
    })
  },

  // 查看某天的记录
  viewDayRecords(date) {
    wx.navigateTo({
      url: `/pages/recordDetail/recordDetail?date=${encodeURIComponent(date)}`
    })
  },

  // 加载阅读记录
  loadRecords() {
    const records = wx.getStorageSync('readingRecords') || {}
    this.setData({ records }, () => {
      this.generateCalendarDays()
    })
  },

  // 加载复习任务
  loadReviewTasks() {
    const reviewTasks = wx.getStorageSync('reviewTasks') || {}
    this.setData({ reviewTasks }, () => {
      this.generateCalendarDays()
    })
  },

  // 回到今天
  goToToday() {
    const today = new Date()
    this.setData({
      currentYear: today.getFullYear(),
      currentMonth: today.getMonth(),
      selectedDate: today.toDateString()
    }, () => {
      this.generateCalendarDays()
    })
  },

  // 添加记录
  addRecord() {
    wx.navigateTo({
      url: `/pages/recordDetail/recordDetail?date=${encodeURIComponent(this.data.selectedDate)}&action=add`
    })
  },

  onShow() {
    this.loadRecords()
    this.loadReviewTasks()
  }
})
