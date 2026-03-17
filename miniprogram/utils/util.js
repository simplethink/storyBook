/**
 * 通用工具函数
 */

/**
 * 格式化日期显示
 * @param {string|Date} dateStr - 日期字符串
 * @returns {string} 格式化后的日期
 */
function formatDate(dateStr) {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  } else {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    const weekday = weekdays[date.getDay()]
    
    return `${year}年${month}月${day}日 ${weekday}`
  }
}

/**
 * 生成唯一 ID
 * @returns {string} 唯一 ID
 */
function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 增加天数
 * @param {string|Date} dateStr - 起始日期
 * @param {number} days - 增加的天数
 * @returns {string} 新的日期字符串
 */
function addDays(dateStr, days) {
  const date = new Date(dateStr)
  date.setDate(date.getDate() + days)
  return date.toDateString()
}

/**
 * 计算阅读时长
 * @param {number} startPage - 开始页码
 * @param {number} endPage - 结束页码
 * @returns {number} 阅读页数
 */
function calculateReadingPages(startPage, endPage) {
  return endPage - startPage + 1
}

/**
 * 格式化时间戳
 * @param {number} timestamp - 时间戳
 * @returns {string} 格式化后的时间
 */
function formatTime(timestamp) {
  const date = new Date(timestamp)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * 格式化持续时间（分钟）
 * @param {number} minutes - 分钟数
 * @returns {string} 格式化后的持续时间
 */
function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes}分钟`
  } else {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`
  }
}

/**
 * 获取艾宾浩斯复习阶段名称
 * @param {number} stage - 阶段数
 * @returns {string} 阶段名称
 */
function getReviewStageName(stage) {
  const stages = [
    '初次记忆',
    '1 天后',
    '2 天后',
    '4 天后',
    '7 天后',
    '15 天后'
  ]
  return stages[stage - 1] || `第${stage}次复习`
}

/**
 * 计算两个日期之间的天数差
 * @param {string|Date} date1 - 日期 1
 * @param {string|Date} date2 - 日期 2
 * @returns {number} 天数差
 */
function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return Math.round(Math.abs((d1 - d2) / oneDay))
}

/**
 * 检查是否是复习日
 * @param {string} dateStr - 日期字符串
 * @param {string} readDate - 阅读日期
 * @returns {boolean} 是否是复习日
 */
function isReviewDay(dateStr, readDate) {
  const reviewCycles = [1, 2, 4, 7, 15]
  const daysDiff = daysBetween(dateStr, readDate)
  return reviewCycles.includes(daysDiff)
}

module.exports = {
  formatDate,
  generateId,
  addDays,
  calculateReadingPages,
  formatTime,
  formatDuration,
  getReviewStageName,
  daysBetween,
  isReviewDay
}
