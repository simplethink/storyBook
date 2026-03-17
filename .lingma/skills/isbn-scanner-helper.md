---
name: isbn-scanner-helper
version: 1.0.0
description: ISBN 扫码查询图书信息助手
author: Assistant
tags: [isbn, scanner, book, api, douban, google]
---

# ISBN 扫码查询助手

## 功能描述
通过 ISBN 条形码快速查询图书详细信息，支持多个数据源（豆瓣、Google Books、Open Library），自动故障转移和结果缓存。

## 使用方式

### 命令格式
```
查询 ISBN：{{isbn}}
优先数据源：{{preferProvider}}
```

### 示例
- "查询这本书的 ISBN: 9787550293427"
- "帮我查一下 ISBN 9787550293427，用豆瓣 API"
- "扫描 ISBN 并获取图书信息：9787550293427"
- "验证这个 ISBN 是否正确：9787550293427"

## 支持的数据源

### 1. 豆瓣 API (推荐) ⭐
**优先级：最高**

**优点：**
- 中文图书信息最准确
- 数据质量高
- 包含封面、简介等完整信息

**缺点：**
- 需要 API Key
- 有调用频率限制

**API 地址：**
```
https://api.douban.com/v2/book/isbn/{{isbn}}
```

**请求头：**
```http
Authorization: Bearer YOUR_API_KEY
```

### 2. Google Books API
**优先级：中等**

**优点：**
- 免费无需 Key
- 外文书籍覆盖广
- 响应速度快

**缺点：**
- 中文书籍信息可能不完整

**API 地址：**
```
https://www.googleapis.com/books/v1/volumes?q=isbn:{{isbn}}
```

### 3. Open Library API
**优先级：备选**

**优点：**
- 完全免费开放
- 开源项目维护
- 数据持续更新

**缺点：**
- 响应速度较慢
- 中文书籍较少

**API 地址：**
```
https://openlibrary.org/isbn/{{isbn}}.json
```

## 查询流程

### Step 1: 验证 ISBN 格式

```javascript
function validateISBN(isbn) {
  // 移除连字符和空格
  const cleaned = isbn.replace(/[-\s]/g, '');
  
  // 检查长度（ISBN-10 或 ISBN-13）
  if (!/^\d{10}$|^\d{13}$/.test(cleaned)) {
    return { valid: false, message: 'ISBN 格式不正确' };
  }
  
  // 校验 ISBN-13
  if (cleaned.length === 13) {
    let sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleaned[i]) * (i % 2 === 0 ? 1 : 3);
    }
    if (sum % 10 !== 0) {
      return { valid: false, message: 'ISBN-13 校验失败' };
    }
  }
  
  return { valid: true, cleaned };
}
```

### Step 2: 依次尝试数据源

**查询策略：**

1. **首先尝试首选数据源**
   ```
   如果用户指定了 preferProvider，先尝试该源
   ```

2. **故障转移机制**
   ```
   豆瓣 → Google Books → Open Library
   （依次降级，直到成功）
   ```

3. **超时设置**
   ```
   每个 API 请求超时时间：5 秒
   超过超时立即切换到下一个源
   ```

### Step 3: 解析返回数据

#### 豆瓣 API 响应解析

```javascript
parseDoubanBook(data) {
  return {
    isbn: data.isbn13,
    title: data.title,
    author: data.author?.join(', ') || '',
    translator: data.translator?.join(', ') || '',
    publisher: data.publisher,
    publishDate: data.pubdate,
    price: data.price,
    pages: data.pages,
    binding: data.binding,
    image: data.image,
    summary: data.summary,
    rating: data.rating?.average || 0,
    tags: data.tags?.map(t => t.name) || []
  };
}
```

#### Google Books API 响应解析

```javascript
parseGoogleBook(data) {
  if (!data.items || data.items.length === 0) {
    return null;
  }
  
  const info = data.items[0].volumeInfo;
  return {
    isbn: info.industryIdentifiers?.[0]?.identifier || '',
    title: info.title,
    subtitle: info.subtitle,
    author: info.authors?.join(', ') || '',
    publisher: info.publisher,
    publishDate: info.publishedDate,
    description: info.description,
    image: info.imageLinks?.thumbnail || '',
    pageCount: info.pageCount,
    categories: info.categories,
    averageRating: info.averageRating || 0,
    language: info.language
  };
}
```

#### Open Library API 响应解析

```javascript
parseOpenLibrary(data) {
  return {
    isbn: data.isbn_13?.[0] || data.isbn_10?.[0] || '',
    title: data.title,
    author: data.authors?.map(a => a.name).join(', ') || '',
    publisher: data.publishers?.[0] || '',
    publishDate: data.first_publish_date || '',
    cover: data.cover?.large || data.cover?.medium || data.cover?.small || '',
    subjects: data.subjects || []
  };
}
```

### Step 4: 缓存结果

```javascript
// 内存缓存（Map 结构）
const cache = new Map();

// 存入缓存
cache.set(isbn, {
  bookInfo,
  timestamp: Date.now(),
  source: providerName
});

// 读取缓存（有效期：24 小时）
const cached = cache.get(isbn);
if (cached && (Date.now() - cached.timestamp) < 24 * 60 * 60 * 1000) {
  return cached.bookInfo;
}
```

## 输出格式

查询成功后，返回以下结构化数据：

```json
{
  "success": true,
  "source": "douban",
  "book": {
    "isbn": "9787550293427",
    "title": "解忧杂货店",
    "author": "[日] 东野圭吾",
    "publisher": "南海出版公司",
    "publishDate": "2014-5",
    "price": "39.50 元",
    "pages": "292",
    "binding": "平装",
    "image": "https://img1.doubanio.com/view/subject/l/public/s28207083.jpg",
    "summary": "现代人内心流失的东西，这家杂货店能帮你找回...",
    "rating": 8.6,
    "tags": ["小说", "日本文学", "东野圭吾"]
  },
  "queryTime": "1.2s"
}
```

## 错误处理

### 常见错误及提示

**错误 1: ISBN 不存在**
```
❌ 未找到该 ISBN 对应的图书信息
💡 请检查 ISBN 号码是否正确
```

**错误 2: API 服务不可用**
```
⚠️ 豆瓣 API 暂时不可用，已切换到 Google Books
✅ 从 Google Books 获取成功
```

**错误 3: 网络超时**
```
⏱️  查询超时，请检查网络连接
🔄 正在重试...
```

**错误 4: 所有数据源都失败**
```
❌ 所有图书 API 都查询失败
💡 请稍后重试或手动输入图书信息
```

## 小程序集成示例

### WXML
```xml
<view class="isbn-scan-section">
  <button bindtap="scanISBN">
    📷 扫描 ISBN
  </button>
  
  <input 
    value="{{isbn}}" 
    placeholder="或手动输入 ISBN"
    bindinput="onISBNInput"
  />
  
  <button bindtap="queryBook" disabled="{{!isbn}}">
    🔍 查询
  </button>
</view>

<view wx:if="{{bookInfo}}" class="book-card">
  <image src="{{bookInfo.image}}" mode="aspectFit" />
  <text class="title">{{bookInfo.title}}</text>
  <text class="author">{{bookInfo.author}}</text>
  <text class="publisher">{{bookInfo.publisher}}</text>
</view>
```

### JS
```javascript
const ISBNHelper = require('../../utils/isbnScanner');

Page({
  data: {
    isbn: '',
    bookInfo: null
  },

  async scanISBN() {
    try {
      const { result } = await wx.scanCode({
        scanType: ['barCode']
      });
      
      this.setData({ isbn: result });
      this.queryBook();
    } catch (err) {
      wx.showToast({
        title: '扫描失败',
        icon: 'none'
      });
    }
  },

  async queryBook() {
    if (!this.data.isbn) return;
    
    wx.showLoading({ title: '查询中...' });
    
    try {
      const bookInfo = await ISBNHelper.searchWithCache(this.data.isbn, {
        preferProvider: 'douban'
      });
      
      this.setData({ bookInfo });
      wx.hideLoading();
    } catch (error) {
      wx.hideLoading();
      wx.showModal({
        title: '查询失败',
        content: error.message,
        showCancel: false
      });
    }
  }
});
```

## 性能优化建议

1. **批量查询**
   - 一次最多查询 10 个 ISBN
   - 使用 Promise.all 并发请求

2. **缓存策略**
   - 内存缓存 + 本地存储双重缓存
   - 热门图书预缓存

3. **图片优化**
   - 使用缩略图而非大图
   - 懒加载图片

4. **降级方案**
   - API 全部失败时，提供手动输入表单
   - 保存用户手动输入的数据到本地

## 配置选项

```yaml
# 默认配置
default:
  providers: ['douban', 'google', 'openlibrary']
  preferProvider: 'douban'
  timeout: 5000  # 5 秒超时
  useCache: true
  cacheExpire: 86400000  # 24 小时
  
# 自定义 API Key
douban:
  apiKey: 'YOUR_DOU BAN_API_KEY'
  rateLimit: 100  # 每分钟最多 100 次
```

## 相关资源

- [豆瓣读书 API](https://developers.douban.com/wiki/?title=book_v2)
- [Google Books API](https://developers.google.com/books/docs/v1/using)
- [Open Library API](https://openlibrary.org/developers/api)
- [ISBN 编码规则](https://zh.wikipedia.org/wiki/国际标准书号)
