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
    readingTime: '', // 阅读时间
    note: '',
    recordId: ''
  },

  onLoad(options) {
    this.setData({ 
      date: decodeURIComponent(options.date || new Date().toDateString()),
      recordId: options.recordId
    })

    // 设置默认阅读时间为当前时间
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    this.setData({
      readingTime: `${hours}:${minutes}`
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

  onIsbnInput(e) {
    this.setData({ isbn: e.detail.value })
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

  onReadingTimeChange(e) {
    this.setData({ readingTime: e.detail.value })
  },

  // 扫描 ISBN 条形码
  async scanISBN() {
    try {
      const res = await wx.scanCode({
        scanType: ['barCode']
      })
      
      if (res.result) {
        // 显示加载提示
        wx.showLoading({
          title: '查询中...',
          mask: true
        })
        
        try {
          // 调用 ISBN查询接口获取图书信息
          const bookInfo = await this.getBookInfoByISBN(res.result)
          
          if (bookInfo && bookInfo.bookName) {
            // 自动填充图书信息
            this.setData({
              isbn: res.result,
              bookName: bookInfo.bookName,
              author: bookInfo.author || '',
              coverUrl: bookInfo.pictures ? JSON.parse(bookInfo.pictures)[0] : ''
            })
            
            wx.hideLoading()
            wx.showToast({
              title: '获取成功',
              icon: 'success'
            })
          } else {
            // 未查询到图书信息，只填充 ISBN
            this.setData({
              isbn: res.result
            })
            wx.hideLoading()
            wx.showToast({
              title: '未找到图书信息，请手动输入',
              icon: 'none'
            })
          }
        } catch (err) {
          console.error('查询图书信息失败:', err)
          wx.hideLoading()
          wx.showToast({
            title: '查询失败，请手动输入',
            icon: 'none'
          })
          // 至少填充 ISBN
          this.setData({
            isbn: res.result
          })
        }
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

  // 通过 ISBN 获取图书信息
  getBookInfoByISBN(isbn) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://data.isbn.work/openApi/getInfoByIsbn',
        data: {
          isbn: isbn,
          appKey: 'ae1718d4587744b0b79f940fbef69e77'
        },
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 0) {
            resolve(res.data.data)
          } else {
            reject(new Error('查询失败'))
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },

  onNoteInput(e) {
    this.setData({ note: e.detail.value })
  },

  // 保存记录
  saveRecord() {
    const { 
      date, coverUrl, bookName, author, isbn, 
      startPage, endPage, duration, readingTime, note, recordId 
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
      readingTime,
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
