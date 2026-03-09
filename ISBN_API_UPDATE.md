# ISBN 查询 API 配置更新说明

## ✅ 更新内容

### 2026-03-09 最新更新

**API 提供商:** ISBN 数据中心
**接口地址:** `http://data.isbn.work/openApi/getInfoByIsbn`
**AppKey:** `ae1718d4587744b0b79f940fbef69e77` (免费公开)

---

## 📊 API 返回数据格式

### 成功响应示例
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
    "format": "16 开",
    "pages": "200 页",
    "edition": "1",
    "words": "197 千字"
  },
  "success": true
}
```

### 字段映射说明

| API 字段 | 映射到 | 说明 |
|---------|--------|------|
| `bookName` | `title` | 书名 |
| `author` | `author` | 作者 |
| `press` | `publisher` | 出版社 |
| `isbn` | `isbn` | ISBN 编号 |
| `pictures` | `cover` | 封面图片（JSON 数组） |
| `bookDesc` | `summary` | 图书简介 |
| `price` | `price` | 价格（分，需转换为元） |
| `pressDate` | `pubdate` | 出版日期 |
| `pressPlace` | `pressPlace` | 出版地 |
| `binding` | `binding` | 装帧 |
| `language` | `language` | 语言 |
| `pages` | `pages` | 页数 |
| `edition` | `edition` | 版次 |
| `words` | `words` | 字数 |

---

## 🔧 代码修改

### bookApi.js 主要变更

#### 1. 添加 AppKey 常量
```javascript
const ISBN_API_KEY = 'ae1718d4587744b0b79f940fbef69e77'
```

#### 2. 请求 URL 带参数
```javascript
url: `${ISBN_API_BASE}?isbn=${isbn}&appKey=${ISBN_API_KEY}`
```

#### 3. 检查返回码
```javascript
if (result.code === 0 && result.data) {
  // code 为 0 表示成功
}
```

#### 4. 解析图片数组
```javascript
let coverUrl = ''
if (book.pictures) {
  try {
    const pictures = JSON.parse(book.pictures)
    coverUrl = Array.isArray(pictures) && pictures.length > 0 ? pictures[0] : ''
  } catch (e) {
    coverUrl = book.pictures || ''
  }
}
```

#### 5. 价格单位转换
```javascript
price: book.price ? (book.price / 100).toFixed(2) : ''
// API 返回的是分，转换为元（除以 100）
```

---

## 🎯 完整的数据处理流程

### 步骤 1: 发起请求
```javascript
wx.request({
  url: `http://data.isbn.work/openApi/getInfoByIsbn?isbn=9787521758368&appKey=ae1718d4587744b0b79f940fbef69e77`,
  method: 'GET'
})
```

### 步骤 2: 检查响应
```javascript
if (response.statusCode === 200 && response.data) {
  const result = response.data
  
  // 检查业务状态码
  if (result.code === 0 && result.data) {
    // 查询成功
  }
}
```

### 步骤 3: 解析数据
```javascript
const book = result.data

return {
  title: book.bookName,           // 书名
  author: book.author,            // 作者
  publisher: book.press,          // 出版社
  isbn: book.isbn,                // ISBN
  cover: parsePictures(book.pictures),  // 封面
  summary: book.bookDesc,         // 简介
  price: (book.price / 100).toFixed(2),  // 价格（元）
  pubdate: book.pressDate,        // 出版日期
  // ... 其他字段
}
```

### 步骤 4: 回显到页面
```javascript
this.setData({
  bookName: bookInfo.title,
  author: bookInfo.author,
  publisher: bookInfo.publisher,
  coverUrl: bookInfo.cover
})
```

---

## 📝 特殊处理

### 1. 图片解析
API 返回的 `pictures` 是 JSON 字符串数组：
```javascript
// 原始数据
pictures: "[\"https://example.com/cover.jpg\"]"

// 解析后
coverUrl: "https://example.com/cover.jpg"
```

**处理代码:**
```javascript
try {
  const pictures = JSON.parse(book.pictures)
  coverUrl = pictures[0] || ''
} catch (e) {
  coverUrl = book.pictures || ''
}
```

### 2. 价格转换
API 返回的价格单位是**分**，需要转换为**元**：
```javascript
// API 返回：8500 (分)
// 转换后：85.00 (元)

price: book.price ? (book.price / 100).toFixed(2) : ''
```

### 3. 错误处理
```javascript
try {
  // 网络请求
  const response = await wx.request({...})
  
  // 检查 HTTP 状态
  if (response.statusCode === 200) {
    // 检查业务状态
    if (result.code === 0) {
      // 成功
    } else {
      // API 返回错误
    }
  }
} catch (error) {
  // 网络错误或解析失败
  console.log('ISBN API 获取失败，尝试其他方式')
}
```

---

## 🧪 测试用例

### 测试 1: 标准 ISBN-13
```
ISBN: 9787521758368
预期：查询到《大众金融》
```

### 测试 2: 标准 ISBN-10
```
ISBN: 7020000002
预期：能正常查询
```

### 测试 3: 无效 ISBN
```
ISBN: 1234567890123
预期：提示"未找到该图书信息"
```

### 测试 4: 网络异常
```
操作：关闭网络后扫描
预期：提示"查询失败，请手动输入"
```

---

## ⚠️ 注意事项

### 1. AppKey 使用
- **当前状态**: 免费公开
- **AppKey**: `ae1718d4587744b0b79f940fbef69e77`
- **限制**: 建议监控调用频率，避免超限

### 2. 域名配置
需要在微信公众平台配置白名单：

**路径:** 
开发 → 开发管理 → 开发设置 → 服务器域名

**添加:**
```
request 合法域名：http://data.isbn.work
```

**建议:** 如果支持 HTTPS，优先使用 HTTPS

### 3. 数据准确性
- 大部分正式出版物都能查到
- 部分外文书可能没有数据
- 自费出版的书籍可能查不到

### 4. 性能优化
**建议添加缓存机制:**
```javascript
const cacheKey = `book_${isbn}`
const cached = wx.getStorageSync(cacheKey)

if (cached) {
  return JSON.parse(cached)
}

// 查询后缓存
wx.setStorageSync(cacheKey, JSON.stringify(bookInfo))
```

---

## 📊 API 对比

| 特性 | ISBN 数据中心 | 豆瓣 API | Google Books |
|-----|------------|---------|-------------|
| 费用 | 免费 | 免费 | 免费 |
| AppKey | 公开提供 | 需申请 | 无需 |
| 中文图书 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 外文图书 | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 返回字段 | 详细 | 详细 | 一般 |
| 稳定性 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 推荐度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 🚀 后续优化建议

### 1. 多源互补
```javascript
async function getBookByISBN(isbn) {
  // 1. ISBN 数据中心（首选）
  let result = await fetchFromISBN(isbn)
  if (result) return result
  
  // 2. 豆瓣（中文补充）
  result = await fetchFromDouban(isbn)
  if (result) return result
  
  // 3. Google Books（外文补充）
  result = await fetchFromGoogleBooks(isbn)
  if (result) return result
  
  return null
}
```

### 2. 批量查询
如果需要一次查询多本书，可以考虑批量接口（如果提供）。

### 3. 数据统计
记录查询成功率、响应时间等指标：
```javascript
const stats = {
  total: 0,
  success: 0,
  fail: 0,
  avgResponseTime: 0
}
```

### 4. 容错机制
```javascript
// 重试机制
async function fetchWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await wx.request({ url })
    } catch (e) {
      if (i === maxRetries - 1) throw e
    }
  }
}
```

---

更新时间：2026-03-09
