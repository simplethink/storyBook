// pages/viewRecord/viewRecord.js
const util = require('../../utils/util.js')

Page({
  data: {
  record: null,
   dateStr: '',
  readingDate: '' // 显示的阅读日期
  },

  onLoad(options) {
   if (options.record) {
     try {
     const record= JSON.parse(decodeURIComponent(options.record))
       this.setData({ 
       record,
       dateStr: options.date || new Date().toDateString()
       })
     console.log('viewRecord onLoad - record:', record)
     console.log('viewRecord onLoad - dateStr:', options.date, 'decoded:', this.data.dateStr)
      
      // 设置显示的阅读日期
      this.setReadingDate(record, options.date)
     } catch (e) {
     console.error('解析记录失败:', e)
       wx.showToast({
         title: '数据加载失败',
         icon: 'none'
       })
     }
   }
  },

  // 设置阅读日期显示
  setReadingDate(record, dateFromOptions) {
   let readingDate = ''
   
   // 优先使用 record 中的 date 字段（如果存在）
   if (record.date) {
   readingDate = record.date
   } else if (dateFromOptions) {
    // 其次使用传递过来的 date 参数
   readingDate = decodeURIComponent(dateFromOptions)
   } else {
    // 最后使用默认值
   readingDate= new Date().toDateString()
   }
   
   this.setData({
   readingDate: this.formatDate(readingDate)
   })
  },

  formatDate(dateStr) {
 return util.formatDate(dateStr || this.data.dateStr)
  },

  editRecord() {
    const { record, dateStr } = this.data
    wx.navigateTo({
      url: `/pages/editRecord/editRecord?date=${encodeURIComponent(dateStr)}&recordId=${record.id}`
    })
  },

  async deleteRecord() {
    const res = await wx.showModal({
      title: '确认删除',
      content: '确定要删除这条读书记录吗？',
      confirmColor: '#f44336'
    })

    if (res.confirm) {
      const allRecords = wx.getStorageSync('readingRecords') || {}
      const dayRecords = allRecords[this.data.dateStr] || []
      
      const index = dayRecords.findIndex(r => r.id === this.data.record.id)
      if (index !== -1) {
        dayRecords.splice(index, 1)
        
        if (dayRecords.length === 0) {
          delete allRecords[this.data.dateStr]
        } else {
          allRecords[this.data.dateStr] = dayRecords
        }
        
        wx.setStorageSync('readingRecords', allRecords)
        
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        })

        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    }
  }
})
