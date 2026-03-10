// pages/recordDetail/recordDetail.js
const app = getApp()
const util = require('../../utils/util.js')
const bookApi = require('../../utils/bookApi.js')

Page({
  data: {
    selectedDate: '',
    readingRecords: [],
    reviewTasks: [],
    showAddMenu: false,
    currentBook: null
  },

  onLoad(options) {
    const date = decodeURIComponent(options.date || new Date().toDateString())
    const action = options.action
    
    this.setData({ selectedDate: date })
    this.loadRecords(date)
    this.loadReviewTasks(date)
    
    if (action === 'add') {
      setTimeout(() => {
        this.showAddMenu()
      }, 500)
    }
  },

  // 格式化日期显示
  formatDate(dateStr) {
    return util.formatDate(dateStr)
  },

  // 加载阅读记录
  loadRecords(date) {
    const allRecords = wx.getStorageSync('readingRecords') || {}
    const dayRecords = allRecords[date] || []
    this.setData({ readingRecords: dayRecords })
  },

  // 加载复习任务
  loadReviewTasks(date) {
    const allTasks = wx.getStorageSync('reviewTasks') || {}
    const dayTasks = allTasks[date] || []
    this.setData({ reviewTasks: dayTasks })
  },

  // 添加阅读记录
  addReadingRecord() {
    this.showAddMenu()
  },

  // 显示添加菜单
  showAddMenu() {
    this.setData({ showAddMenu: true })
  },

  // 隐藏添加菜单
  hideAddMenu() {
    this.setData({ showAddMenu: false })
  },

  stopPropagation(e) {
    e.stopPropagation()
  },

  // 扫描条形码
  async scanBarcode() {
    this.hideAddMenu()
    
    try {
      const res = await wx.scanCode({
        onlyFromCamera: false,
        checkResult: true
      })
      
      if (res.result) {
        console.log('扫描结果:', res.result)
        // 调用图书 API 获取信息
        this.fetchBookInfoByBarcode(res.result)
      }
    } catch (err) {
      if (err.errMsg !== 'scanCode:fail cancel') {
        wx.showToast({
          title: '扫描失败',
          icon: 'none'
        })
      }
    }
  },

  // 拍照添加
  async takePhoto() {
    this.hideAddMenu()
    
    try {
      const res = await wx.chooseImage({
        count: 1,
        sourceType: ['camera', 'album'],
        sizeType: ['compressed']
      })
      
      const tempFilePath = res.tempFilePaths[0]
      
      // 使用 OCR 识别或手动输入
      wx.navigateTo({
        url: `/pages/editRecord/editRecord?date=${encodeURIComponent(this.data.selectedDate)}&coverUrl=${encodeURIComponent(tempFilePath)}`
      })
    } catch (err) {
      if (err.errMsg !== 'chooseImage:fail cancel') {
        wx.showToast({
          title: '拍照失败',
          icon: 'none'
        })
      }
    }
  },

  // 手动输入
  manualAdd() {
    this.hideAddMenu()
    wx.navigateTo({
      url: `/pages/editRecord/editRecord?date=${encodeURIComponent(this.data.selectedDate)}`
    })
  },

  // 通过条形码获取图书信息
  async fetchBookInfoByBarcode(barcode) {
    wx.showLoading({ title: '获取图书信息...' })
    
    try {
      const bookInfo = await bookApi.getBookByISBN(barcode)
      
      wx.hideLoading()
      
      if (bookInfo && bookInfo.title) {
        this.setData({ currentBook: bookInfo })
        
        // 跳转到编辑页面
        wx.navigateTo({
          url: `/pages/editRecord/editRecord?date=${encodeURIComponent(this.data.selectedDate)}&bookInfo=${encodeURIComponent(JSON.stringify(bookInfo))}`
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '未找到图书信息，是否手动输入？',
          success: (res) => {
            if (res.confirm) {
              this.manualAdd()
            }
          }
        })
      }
    } catch (error) {
      wx.hideLoading()
      console.error('获取图书信息失败:', error)
      wx.showModal({
        title: '提示',
        content: '获取图书信息失败，是否手动输入？',
        success: (res) => {
          if (res.confirm) {
            this.manualAdd()
          }
        }
      })
    }
  },

  // 添加复习任务
  addReviewTask() {
    this.hideAddMenu()
    wx.navigateTo({
      url: `/pages/addReviewTask/addReviewTask?date=${encodeURIComponent(this.data.selectedDate)}`
    })
  },

  // 查看记录详情
  viewRecordDetail(e) {
   const record= e.currentTarget.dataset.record
    wx.navigateTo({
      url: `/pages/viewRecord/viewRecord?record=${encodeURIComponent(JSON.stringify(record))}&date=${encodeURIComponent(this.data.selectedDate)}`
    })
  },

  // 切换复习任务完成状态
  toggleReviewTask(e) {
    const taskId = e.currentTarget.dataset.id
    const allTasks = wx.getStorageSync('reviewTasks') || {}
    const dayTasks = allTasks[this.data.selectedDate] || []
    
    const taskIndex = dayTasks.findIndex(t => t.id === taskId)
    if (taskIndex !== -1) {
      dayTasks[taskIndex].completed = !dayTasks[taskIndex].completed
      
      allTasks[this.data.selectedDate] = dayTasks
      wx.setStorageSync('reviewTasks', allTasks)
      
      this.loadReviewTasks(this.data.selectedDate)
      
      wx.showToast({
        title: dayTasks[taskIndex].completed ? '已完成' : '未完成',
        icon: 'success'
      })
    }
  },

  // 完成复习
  completeReview(e) {
    const taskId = e.currentTarget.dataset.id
    this.toggleReviewTask({ currentTarget: { dataset: { id: taskId } } })
  },

  // 获取复习阶段名称
  getReviewStageName(stage) {
  const stages = ['初次记忆', '1 天后', '2 天后', '4 天后', '7 天后', '15 天后', '30 天后', '90 天后']
    return stages[stage - 1] || `第${stage}次`
  },

  onShow() {
    this.loadRecords(this.data.selectedDate)
    this.loadReviewTasks(this.data.selectedDate)
  }
})
