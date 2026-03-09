# ISBN 扫码获取图书信息 - 使用说明

## 📚 功能概述

通过扫描图书 ISBN条形码，自动获取图书的详细信息（书名、作者、出版社、封面等），并自动填充到表单中。

**应用场景：**
- ✅ 编辑记录页面 - ISBN 输入框旁的扫码按钮
- ✅ 记录详情页面 - 底部弹窗菜单的"扫码条形码"选项

## 🔧 使用的接口

### 免费ISBN查询接口

**接口信息：**
- **接口地址**: `http://data.isbn.work/openApi/getInfoByIsbn`
- **请求方式**: GET
- **AppKey**: `ae1718d4587744b0b79f940fbef69e77` (免费公开)
- **返回格式**: JSON

**请求示例：**
```
http://data.isbn.work/openApi/getInfoByIsbn?isbn=9787521758368&appKey=ae1718d4587744b0b79f940fbef69e77
```

**返回数据字段：**
```json
{
  "code": 0,
  "data": {
    "isbn": "9787521758368",
    "bookName": "大众金融",
    "author": "田国立主编",
    "press": "中信出版集团",
    "pressDate": "2023.6",
    "pressPlace": "北京",
    "price": 8500,
    "pictures": "[\"图片 URL\"]",
    "bookDesc": "图书简介",
    "binding": "其他",
    "language": "Chinese 汉语",
    "format": "16开",
    "pages": "200页",
    "edition": "1",
    "words": "197千字"
  },
  "success": true
}
```

## 🎯 使用流程

### 1. 点击扫码按钮
在编辑记录页面，点击 ISBN 输入框右侧的"扫码"按钮

### 2. 扫描ISBN条形码
使用手机摄像头对准图书背后的ISBN条形码进行扫描

### 3. 自动获取信息
系统会自动调用ISBN查询接口，获取图书信息并自动填充：
- ✅ ISBN号码
- ✅ 图书名称
- ✅ 作者
- ✅ 出版社（暂未使用）
- ✅ 图书封面

### 4. 手动补充
可以手动补充或修改其他信息（阅读进度、时长、笔记等）

## 💡 技术实现

### 统一的 API 调用

所有扫码功能都使用 `utils/bookApi.js` 中的统一接口：

```javascript
const bookApi = require('../../utils/bookApi.js')

// 获取图书信息
const bookInfo = await bookApi.getBookByISBN(isbn)
```

### 核心代码（recordDetail.js）

```javascript
// 扫描条形码
async scanBarcode() {
  this.hideAddMenu()
  
  const res = await wx.scanCode({
    scanType: ['barCode']
  })
  
  if (res.result) {
    wx.showLoading({ title: '查询中...' })
    
    try {
      const bookInfo = await bookApi.getBookByISBN(res.result)
      wx.hideLoading()
      
      if (bookInfo && bookInfo.title) {
        // 跳转到编辑页面并传递图书信息
        wx.navigateTo({
          url: `/pages/editRecord/editRecord?date=${this.data.selectedDate}&bookInfo=${JSON.stringify(bookInfo)}`
        })
        wx.showToast({ title: '获取成功', icon: 'success' })
      } else {
        wx.showModal({
          title: '提示',
          content: '未找到图书信息，是否手动输入？'
        })
      }
    } catch (err) {
      wx.hideLoading()
      wx.showModal({ title: '提示', content: '查询失败' })
    }
  }
}
```

### bookApi.js 配置（editRecord.js）

```javascript
// 扫描ISBN条形码
async scanISBN() {
  const res = await wx.scanCode({
    scanType: ['barCode']
  })
  
  if (res.result) {
    wx.showLoading({ title: '查询中...' })
    
    try {
      const bookInfo = await this.getBookInfoByISBN(res.result)
      
      if (bookInfo && bookInfo.bookName) {
        // 自动填充图书信息
        this.setData({
          isbn: res.result,
          bookName: bookInfo.bookName,
          author: bookInfo.author || '',
          coverUrl: bookInfo.pictures ? JSON.parse(bookInfo.pictures)[0] : ''
        })
        
        wx.showToast({ title: '获取成功', icon: 'success' })
      } else {
        wx.showToast({ title: '未找到图书信息', icon: 'none' })
      }
    } catch (err) {
      wx.showToast({ title: '查询失败', icon: 'none' })
    }
    
    wx.hideLoading()
  }
}

// 通过ISBN获取图书信息
getBookInfoByISBN(isbn) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'http://data.isbn.work/openApi/getInfoByIsbn',
      data: {
        isbn: isbn,
        appKey: 'ae1718d4587744b0b79f940fbef69e77'
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data.data)
        } else {
          reject(new Error('查询失败'))
        }
      },
      fail: reject
    })
  })
}
```

## 📝 测试数据

**测试ISBN**: `9787521758368`
- 书名：大众金融
- 作者：田国立主编
- 出版社：中信出版集团
- 出版时间：2023.6

## ⚠️ 注意事项

1. **网络要求**: 需要联网才能查询图书信息
2. **接口限制**: 免费接口可能有调用频率限制，请勿频繁扫描
3. **容错处理**: 
   - 如果查询失败，仍会填充ISBN号码，可手动输入其他信息
   - 如果未找到图书信息，会提示手动输入
4. **数据解析**: 封面图片URL需要从JSON字符串中解析

## 🎨 用户体验优化

- ✅ 扫码时显示"查询中..."加载提示
- ✅ 查询成功显示"获取成功"
- ✅ 查询失败显示友好提示
- ✅ 即使查询失败也会填充ISBN号码
- ✅ 支持手动输入和扫码两种方式

## 🔄 备用接口

如果主接口不可用，可以考虑以下备选方案：

1. **接口2**: `https://mall-api.kimichen.vip/books/isbn/{isbn}`
   - 注意：该接口可能不稳定

2. **豆瓣API**（需自建云函数）:
   - 需要在云函数中封装请求
   - 豆瓣API有访问频率限制

## 📱 微信小程序配置

确保在 `app.json` 或页面配置中添加扫码权限：
```json
{
  "permission": {
    "scope.camera": {
      "desc": "用于扫描图书ISBN条形码"
    }
  }
}
```
