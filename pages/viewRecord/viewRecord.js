// pages/viewRecord/viewRecord.js
const util = require('../../utils/util.js')

Page({
  data: {
    record: null,
    dateStr: ''
  },

  onLoad(options) {
    if (options.record) {
      try {
        const record = JSON.parse(decodeURIComponent(options.record))
        this.setData({ 
          record,
          dateStr: options.date || new Date().toDateString()
        })
      } catch (e) {
        console.error('解析记录失败:', e)
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      }
    }
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
