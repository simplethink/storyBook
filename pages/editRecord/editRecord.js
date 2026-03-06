// pages/editRecord/editRecord.js
const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    date: '',
    coverUrl: '',
    bookName: '',
    author: '',
    isbn: '',
    startPage: 0,
    endPage: 0,
    duration: 30,
    note: '',
    recordId: ''
  },

  onLoad(options) {
    this.setData({ 
      date: decodeURIComponent(options.date || new Date().toDateString()),
      recordId: options.recordId
    })

    // 如果有传入的图书信息
    if (options.bookInfo) {
      try {
        const bookInfo = JSON.parse(decodeURIComponent(options.bookInfo))
        this.setData({
          bookName: bookInfo.title || '',
          author: bookInfo.author || '',
          isbn: bookInfo.isbn || '',
          publisher: bookInfo.publisher || '',
          coverUrl: bookInfo.cover || ''
        })
      } catch (e) {
        console.error('解析图书信息失败:', e)
      }
    }

    // 如果是编辑已有记录
    if (options.recordId) {
      this.loadRecord(options.recordId)
    }

    // 如果有封面图片
    if (options.coverUrl) {
      this.setData({
        coverUrl: decodeURIComponent(options.coverUrl)
      })
    }
  },

  // 加载已有记录
  loadRecord(recordId) {
    const allRecords = wx.getStorageSync('readingRecords') || {}
    
    // 遍历所有日期查找记录
    for (let date in allRecords) {
      const records = allRecords[date] || []
      const record = records.find(r => r.id === recordId)
      if (record) {
        this.setData({
          coverUrl: record.coverUrl || '',
          bookName: record.bookName || '',
          author: record.author || '',
          isbn: record.isbn || '',
          startPage: record.startPage || 0,
          endPage: record.endPage || 0,
          duration: record.duration || 30,
          note: record.note || ''
        })
        break
      }
    }
  },

  // 选择封面
  async chooseCover() {
    try {
      const res = await wx.chooseImage({
        count: 1,
        sourceType: ['camera', 'album'],
        sizeType: ['compressed']
      })
      
      this.setData({
        coverUrl: res.tempFilePaths[0]
      })
    } catch (err) {
      if (err.errMsg !== 'chooseImage:fail cancel') {
        wx.showToast({
          title: '选择失败',
          icon: 'none'
        })
      }
    }
  },

  // 输入事件处理
  onBookNameInput(e) {
    this.setData({ bookName: e.detail.value })
  },

  onAuthorInput(e) {
    this.setData({ author: e.detail.value })
  },

  onStartPageInput(e) {
    this.setData({ startPage: parseInt(e.detail.value) || 0 })
  },

  onEndPageInput(e) {
    this.setData({ endPage: parseInt(e.detail.value) || 0 })
  },

  onDurationInput(e) {
    this.setData({ duration: parseInt(e.detail.value) || 0 })
  },

  onNoteInput(e) {
    this.setData({ note: e.detail.value })
  },

  // 保存记录
  saveRecord() {
    const { 
      date, coverUrl, bookName, author, isbn, 
      startPage, endPage, duration, note, recordId 
    } = this.data

    if (!bookName) {
      wx.showToast({
        title: '请输入图书名称',
        icon: 'none'
      })
      return
    }

    const allRecords = wx.getStorageSync('readingRecords') || {}
    const dayRecords = allRecords[date] || []

    const recordData = {
      id: recordId || util.generateId(),
      coverUrl,
      bookName,
      author,
      isbn,
      startPage,
      endPage,
      duration,
      note,
      createTime: recordId ? dayRecords.find(r => r.id === recordId)?.createTime : Date.now(),
      updateTime: Date.now()
    }

    if (recordId) {
      // 更新已有记录
      const index = dayRecords.findIndex(r => r.id === recordId)
      if (index !== -1) {
        dayRecords[index] = recordData
      }
    } else {
      // 添加新记录
      dayRecords.push(recordData)
    }

    allRecords[date] = dayRecords
    wx.setStorageSync('readingRecords', allRecords)

    // 生成或更新复习任务
    this.createReviewTask(recordData)

    wx.showToast({
      title: '保存成功',
      icon: 'success'
    })

    setTimeout(() => {
      wx.navigateBack()
    }, 1500)
  },

  // 创建复习任务
  createReviewTask(record) {
    // 检查全局开关，如果关闭则不自动生成
    const app = getApp()
    if (!app.globalData.autoGenerateReview) {
      return
    }
    
    const allTasks = wx.getStorageSync('reviewTasks') || {}
    
    // 艾宾浩斯记忆法复习周期（天）
    const reviewCycles = [1, 2, 4, 7, 15]
    
    reviewCycles.forEach((days, index) => {
      const reviewDate = util.addDays(this.data.date, days)
      
      if (!allTasks[reviewDate]) {
        allTasks[reviewDate] = []
      }
      
      const task = {
        id: util.generateId(),
        bookName: record.bookName,
        stage: index + 1,
        completed: false,
        createTime: Date.now()
      }
      
      allTasks[reviewDate].push(task)
    })
    
    wx.setStorageSync('reviewTasks', allTasks)
  }
})
