// pages/editRecord/editRecord.js
const app = getApp()
const util = require('../../utils/util.js')
const bookApi = require('../../utils/bookApi.js')

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
   recordId: '',
  datePickerValue: '' // 日期选择器的值
  },

  onLoad(options) {
  const originalDateStr = decodeURIComponent(options.date || new Date().toDateString())
   this.setData({ 
    recordId: options.recordId,
   })

  console.log('编辑页面 onLoad - 原始日期:', originalDateStr, '转换后:', date)
   const dateObj = new Date(originalDateStr)
   const date = dateObj.toDateString()
    
    this.setData({
     date: date,
     datePickerValue: this.formatDatePicker(dateObj),
     dateDisplay: this.formatDate(date)
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

  // 格式化日期选择器格式
  formatDatePicker(dateObj) {
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
   return `${year}-${month}-${day}`
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
   date: date, // 更新为记录的实际日期
     coverUrl: record.coverUrl || '',
      bookName: record.bookName || '',
          author: record.author || '',
          isbn: record.isbn || '',
          startPage: record.startPage || 0,
          endPage: record.endPage || 0,
          duration: record.duration || 30,
          note: record.note || '',
   datePickerValue: this.formatDatePicker(new Date(date)),
   dateDisplay: this.formatDate(date)
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
        const isbn = res.result
        console.log('扫描到 ISBN:', isbn)
        
        // 设置 ISBN
        this.setData({
          isbn: isbn
        })
        
        // 显示加载提示
        wx.showLoading({
          title: '查询图书信息...',
          mask: true
        })
        
        try {
          // 调用 API 获取图书信息
          const bookInfo = await bookApi.getBookByISBN(isbn)
          
          wx.hideLoading()
          
          if (bookInfo && bookInfo.title) {
            console.log('获取到图书信息:', bookInfo)
            
            // 回显到页面
            this.setData({
              bookName: bookInfo.title || '',
              author: bookInfo.author || '',
              publisher: bookInfo.publisher || '',
              coverUrl: bookInfo.cover || '',
              // summary: bookInfo.summary || '',  // 如果需要可以添加
              // price: bookInfo.price || '',     // 如果需要可以添加
              // pages: bookInfo.pages || 0,      // 如果需要可以添加
            })
            
            wx.showToast({
              title: '获取成功',
              icon: 'success'
            })
          } else {
            console.log('未找到图书信息')
            wx.showToast({
              title: '未找到该图书信息',
              icon: 'none',
              duration: 2000
            })
          }
        } catch (err) {
          wx.hideLoading()
          console.error('查询图书信息失败:', err)
          wx.showToast({
            title: '查询失败，请手动输入',
            icon: 'none'
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

    // 同步到云函数
    this.syncToCloud(recordData, recordId)

    wx.showToast({
      title: '保存成功',
      icon: 'success'
    })

    setTimeout(() => {
      wx.navigateBack()
    }, 1500)
  },

  onDateChange(e) {
    this.setData({ 
  datePickerValue: e.detail.value,
  date: new Date(e.detail.value).toDateString(),
  dateDisplay: this.formatDate(new Date(e.detail.value).toDateString())
    })
  },

  formatDate(dateStr) {
   return util.formatDate(dateStr)
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
  const reviewCycles = [1, 2, 4, 7, 15, 30, 90]
    
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
  },

  // 同步记录到云端
  syncToCloud(recordData, recordId) {
 const app = getApp()
    
    // 准备上传的数据
 const uploadData = {
     ...recordData,
  date: this.data.date // 确保包含日期字段
   }
    
  // 判断是新增还是编辑
  const action= recordId ? 'update' : 'add'
  console.log(`开始${action === 'add' ? '新增' : '编辑'}记录并同步到云端:`, uploadData)
    
    // 调用云函数同步
  app.syncReadingRecords(action, [uploadData], (res) => {
    if (res.success) {
  console.log(`${action === 'add' ? '新增' : '编辑'}成功:`, res.message)
    } else {
  console.error('云端同步失败:', res.errMsg)
      // 不同步失败不影响本地保存，只是提示一下
      wx.showToast({
        title: '本地已保存，云端同步失败',
        icon: 'none',
        duration: 2000
      })
    }
  })
  }
})
