// pages/addReviewTask/addReviewTask.js
const util = require('../../utils/util.js')

Page({
  data: {
    date: '',
    bookName: '',
    stageIndex: 0,
    reviewDate: new Date().toISOString().split('T')[0],
    minDate: new Date().toISOString().split('T')[0],
    note: '',
    stages: ['第 1 次复习（1 天后）', '第 2 次复习（2 天后）', '第 3 次复习（4 天后）', '第 4 次复习（7 天后）', '第 5 次复习（15 天后）']
  },

  onLoad(options) {
    const date = decodeURIComponent(options.date || new Date().toDateString())
    this.setData({ 
      date,
      reviewDate: this.formatDatePicker(date)
    })
  },

  // 格式化日期选择器格式
  formatDatePicker(dateStr) {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  formatDate(dateStr) {
    return util.formatDate(new Date(dateStr).toDateString())
  },

  onBookNameInput(e) {
    this.setData({ bookName: e.detail.value })
  },

  onStageChange(e) {
    this.setData({ stageIndex: parseInt(e.detail.value) })
  },

  onDateChange(e) {
    this.setData({ reviewDate: e.detail.value })
  },

  onNoteInput(e) {
    this.setData({ note: e.detail.value })
  },

  saveTask() {
    const { date, bookName, stageIndex, reviewDate, note } = this.data

    if (!bookName) {
      wx.showToast({
        title: '请输入图书名称',
        icon: 'none'
      })
      return
    }

    const allTasks = wx.getStorageSync('reviewTasks') || {}
    
    // 将 reviewDate 转换为 Date 对象并格式化为 toDateString()
    const [year, month, day] = reviewDate.split('-')
    const taskDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toDateString()

    if (!allTasks[taskDate]) {
      allTasks[taskDate] = []
    }

    const task = {
      id: util.generateId(),
      bookName,
      stage: stageIndex + 1,
      completed: false,
      note,
      createTime: Date.now()
    }

    allTasks[taskDate].push(task)
    wx.setStorageSync('reviewTasks', allTasks)

    wx.showToast({
      title: '添加成功',
      icon: 'success'
    })

    setTimeout(() => {
      wx.navigateBack()
    }, 1500)
  }
})
