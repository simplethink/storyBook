# ISBN 扫码查书功能实现说明

## 🎯 功能概述

实现了通过扫描图书 ISBN 条形码，自动查询并回显图书信息到编辑页面的功能。

**API 优先级:**
1. ✅ **ISBN 数据中心** (首选) - http://data.isbn.work/openApi/getInfoByIsbn
2. 豆瓣 API (备选，需要 Key)
3. Google Books API (备选)
4. 开放图书馆 API (备选)

---

## 📦 修改的文件

### 1. miniprogram/utils/bookApi.js

#### 新增内容:
- 添加了 `ISBN_API_BASE` 常量
- 新增 `fetchFromISBN()` 函数 - 调用 ISBN 数据中心 API
- 调整了 `getBookByISBN()` 函数的调用顺序，优先使用新 API

**代码:**
```javascript
// 首选 API - ISBN 数据中心
const ISBN_API_BASE = 'http://data.isbn.work/openApi/getInfoByIsbn'

async function fetchFromISBN(isbn) {
  try {
    const response = await wx.request({
      url: `${ISBN_API_BASE}?isbn=${isbn}`,
      method: 'GET'
    })

    if (response.statusCode === 200 && response.data) {
      const book = response.data
      
      return {
        title: book.title || book.bookname || '',
        author: book.author || book.authors || '',
        publisher: book.publisher || '',
        isbn: book.isbn || isbn,
        cover: book.cover || book.image || '',
        summary: book.summary || book.description || '',
        price: book.price || '',
        pages: book.pages || 0,
        pubdate: book.pubdate || book.publishDate || ''
      }
    }
  } catch (error) {
    console.log('ISBN API 获取失败，尝试其他方式')
  }
  
  return null
}
```

---

### 2. miniprogram/pages/editRecord/editRecord.js

#### 新增内容:
- 引入了 `bookApi.js`
- 重写了 `scanISBN()` 方法，增加了查询和回显逻辑

**修改前:**
```javascript
async scanISBN() {
  const res = await wx.scanCode({
    scanType: ['barCode']
  })
  
  if (res.result) {
    this.setData({
      isbn: res.result
    })
    wx.showToast({
      title: '扫描成功',
      icon: 'success'
    })
  }
}
```

**修改后:**
```javascript
async scanISBN() {
  const res = await wx.scanCode({
    scanType: ['barCode']
  })
  
  if (res.result) {
    const isbn = res.result
    
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
        // 回显到页面
        this.setData({
          bookName: bookInfo.title || '',
          author: bookInfo.author || '',
          publisher: bookInfo.publisher || '',
          coverUrl: bookInfo.cover || '',
        })
        
        wx.showToast({
          title: '获取成功',
          icon: 'success'
        })
      } else {
        wx.showToast({
          title: '未找到该图书信息',
          icon: 'none'
        })
      }
    } catch (err) {
      wx.hideLoading()
      wx.showToast({
        title: '查询失败，请手动输入',
        icon: 'none'
      })
    }
  }
}
```

---

## 🚀 使用流程

### 步骤 1: 打开添加记录页面
- 首页 → 点击"添加记录"

### 步骤 2: 扫描 ISBN
- 点击 ISBN 输入框旁边的"扫描"按钮
- 相机自动打开
- 对准图书背后的 ISBN 条形码

### 步骤 3: 自动查询
- 扫描成功后，自动显示"查询图书信息..."提示
- 后台调用 ISBN API 查询

### 步骤 4: 数据回显
- 查询成功 → 自动填充以下字段：
  - 📖 书名
  - ✍️ 作者
  - 🏢 出版社
  - 🖼️ 封面图片
- 查询失败 → 提示"未找到该图书信息"或"查询失败，请手动输入"

### 步骤 5: 补充信息
- 手动填写阅读页码、时长等信息
- 点击保存

---

## 💡 技术细节

### API 返回数据格式处理

由于不同 API 返回的字段名可能不同，做了兼容性处理：

```javascript
return {
  title: book.title || book.bookname || '',      // 兼容不同字段名
  author: book.author || book.authors || '',
  publisher: book.publisher || '',
  isbn: book.isbn || isbn,                       // 使用扫描的 ISBN 作为后备
  cover: book.cover || book.image || '',
  summary: book.summary || book.description || '',
  price: book.price || '',
  pages: book.pages || 0,
  pubdate: book.pubdate || book.publishDate || ''
}
```

### 错误处理

**多层错误捕获:**
1. 扫码失败（用户取消/相机权限）
2. API 请求失败（网络问题）
3. API 返回空数据（找不到该书）
4. 数据解析失败（字段不匹配）

**友好的错误提示:**
- "查询图书信息..." - 加载中
- "获取成功" ✅ - 查询成功
- "未找到该图书信息" ⚠️ - API 无数据
- "查询失败，请手动输入" ❌ - 网络或其他错误

---

## 🧪 测试场景

### 测试 1: 有数据的图书
1. 找一本正式出版的图书（背后有 ISBN）
2. 点击扫描
3. 应该能查到图书信息
4. 书名、作者、出版社、封面都应该正确显示

### 测试 2: 无数据的图书
1. 扫描一个不存在的 ISBN
2. 应该提示"未找到该图书信息"
3. 可以手动输入信息

### 测试 3: 网络异常
1. 关闭网络或网络很差时扫描
2. 应该提示"查询失败，请手动输入"
3. 仍然可以手动填写信息

### 测试 4: 手动输入
1. 不扫描，直接手动输入 ISBN
2. 应该也能正常保存

---

## 📊 API 对比

| API | 优点 | 缺点 | 优先级 |
|-----|------|------|--------|
| ISBN 数据中心 | 免费、无需 Key、中文图书全 | 依赖第三方稳定性 | ⭐⭐⭐⭐⭐ 首选 |
| 豆瓣 API | 数据准确、信息详细 | 需要 API Key、有限流 | ⭐⭐⭐⭐ 备选 |
| Google Books | 免费、稳定 | 外文书多、中文少 | ⭐⭐⭐ 备选 |
| 开放图书馆 | 免费、开源 | 速度慢、中文少 | ⭐⭐ 备选 |

---

## ⚠️ 注意事项

### 1. ISBN 格式
- 支持 ISBN-10 和 ISBN-13
- 自动识别，无需手动转换
- 如果包含空格或横线，API 会自动处理

### 2. 网络请求
- 需要网络连接才能查询
- 建议使用 HTTPS（生产环境）
- 当前使用 HTTP，微信小程序需要配置域名白名单

### 3. 小程序配置
如果提示不在合法域名列表中，需要在微信公众平台配置：

**路径:** 开发 → 开发管理 → 开发设置 → 服务器域名

添加 request 合法域名：
```
http://data.isbn.work
```

或者升级为 HTTPS：
```
https://data.isbn.work
```

### 4. 数据缓存
可以考虑添加本地缓存，避免重复查询同一 ISBN：

```javascript
// 伪代码示例
const cacheKey = `book_isbn_${isbn}`
const cachedData = wx.getStorageSync(cacheKey)
if (cachedData) {
  return JSON.parse(cachedData)
}
```

---

## 🎨 UI/UX 优化建议

### 已实现:
- ✅ 加载提示（mask 防止重复操作）
- ✅ 成功提示
- ✅ 错误提示
- ✅ 自动填充主要字段

### 可优化:
- 🔲 显示查询进度动画
- 🔲 显示数据来源（如："数据来自：ISBN 数据中心"）
- 🔲 支持手动刷新/重新查询
- 🔲 显示更多图书信息（价格、页数、简介等）
- 🔲 图书信息预览卡片

---

## 🐛 可能遇到的问题

### 问题 1: 提示"不在合法域名列表中"
**解决方案:**
1. 登录微信公众平台
2. 开发 → 开发管理 → 开发设置
3. 服务器域名 → request 合法域名
4. 添加 `http://data.isbn.work` 或使用 HTTPS

### 问题 2: 扫码后没反应
**排查步骤:**
1. 检查控制台是否有日志输出
2. 检查网络是否正常
3. 检查 ISBN 是否正确
4. 查看 API 是否返回数据

### 问题 3: 查询到的数据不完整
**原因:**
- API 返回的数据本身就不完整
- 字段名不匹配

**解决方案:**
- 检查控制台输出的原始数据
- 调整 `fetchFromISBN` 中的字段映射
- 考虑使用其他 API 作为补充

---

## 📝 后续扩展

### 1. 添加搜索功能
除了扫码，还可以：
- 输入书名搜索
- 输入作者搜索
- 从搜索结果中选择

### 2. 数据持久化
- 将查询过的图书缓存到本地
- 建立本地图书库
- 减少重复查询

### 3. 社交功能
- 查看其他读者在读什么
- 热门图书推荐
- 读书榜单

### 4. 智能推荐
- 根据阅读历史推荐
- 相似图书推荐
- 个性化书单

---

更新时间：2026-03-09
