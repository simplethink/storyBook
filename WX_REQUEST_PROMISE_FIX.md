# wx.request Promise封装说明

## 问题背景

在 `bookApi.js` 中，我们最初使用了 `await wx.request({...})` 的方式，但这种方式存在问题。

### 原始错误代码（第 52-69 行）

```javascript
const response = await wx.request({
  url: ISBN_API_BASE,
  data: { isbn, appKey: ISBN_API_KEY },
  method: 'GET',
  success: (res) => {
    console.log('请求成功', res.statusCode)
  },
  fail: (err) => {
    console.error('请求失败', err)
    throw new Error('网络请求失败') // ❌ 这个 throw 无法被外部 try-catch 捕获
  }
})
```

### 问题分析

1. **混用了回调和 Promise 两种方式**
   - 当提供了 `success/fail/complete` 回调时，`wx.request` **不会返回 Promise**
   - `await` 等待的是 `undefined`，而不是响应数据

2. **回调中的 throw 无效**
   - `fail` 回调中的 `throw` 无法被外层 `try-catch` 捕获
   - 异步回调中的异常不会传递到同步代码块

3. **response 无法获取响应**
   - 由于没有返回值，`response` 变量为 `undefined`
   - 后续代码无法访问 HTTP 响应状态码和数据

## 微信官方文档说明

根据 [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/api.html)：

> **基础库 2.10.2 版本起**，异步 API 支持 callback & promise 两种调用方式。
> 
> **当接口参数 Object 对象中不包含 success/fail/complete 时将默认返回 promise**，否则仍按回调方式执行，无返回值。

### ⚠️ 重要提示

官方特别说明：
> 部分接口如 `downloadFile`, **`request`**, `uploadFile`, `connectSocket` 等本身就有返回值，它们的 promisify 需要**开发者自行封装**。

这意味着：
- ✅ 不提供回调时，某些基础库版本会返回 Promise
- ⚠️ 但官方建议开发者手动封装以确保兼容性
- ❌ 不能同时使用回调和 await

## 解决方案

### 方案一：Promise封装（推荐）⭐

创建统一的请求封装工具函数：

**util.js**
```javascript
/**
 * Promise封装wx.request
 * @param {Object} options - wx.request 参数对象
 * @returns {Promise<Object>} 返回 Promise 对象，resolve 时为 wx.request 的响应对象
 */
function request(options) {
  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      success: resolve,
      fail: reject
    })
  })
}

module.exports = {
  // ... 其他工具函数
  request
}
```

**使用时：**
```javascript
const util = require('./util')

async function fetchData() {
  try {
    const response = await util.request({
      url: 'https://api.example.com/data',
      method: 'GET',
      data: { id: 123 }
    })
    
    // ✅ 可以正常访问 response
    console.log(response.statusCode)
    console.log(response.data)
    
  } catch (error) {
    // ✅ 可以正确捕获错误
    console.error('请求失败:', error)
  }
}
```

### 方案二：纯回调方式（不推荐）

```javascript
wx.request({
  url: 'https://api.example.com/data',
  method: 'GET',
  success: (res) => {
    console.log(res.statusCode)
    console.log(res.data)
  },
  fail: (err) => {
    console.error('请求失败:', err)
  }
})
```

缺点：
- 无法使用 async/await 语法糖
- 多层嵌套会导致"回调地狱"
- 错误处理分散

### 方案三：原生 Promise（繁琐）

```javascript
function fetchData() {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://api.example.com/data',
      method: 'GET',
      success: resolve,
      fail: reject
    })
  })
}

// 使用时
fetchData()
  .then(response => console.log(response))
  .catch(error => console.error(error))
```

## 已完成的修改

### 1. 更新 util.js

✅ 添加了 `request` 工具函数
✅ 导出该函数供其他模块使用

### 2. 更新 bookApi.js

✅ 引入 `util` 模块
✅ 将所有 `wx.request` 调用改为 `util.request`
   - `fetchFromISBNAPI`
   - `fetchFromDouban`
   - `fetchFromGoogleBooks`
   - `fetchFromOpenLibrary`
   - `searchBooks`

### 3. 优化错误处理

✅ 移除了无效的回调内 `throw`
✅ 统一在外层 `try-catch` 中处理错误
✅ 错误信息可以正确传递给调用方

## 最佳实践建议

### ✅ DO（推荐做法）

1. **使用封装的工具函数**
   ```javascript
   const response = await util.request({ url, method, data })
   ```

2. **统一的错误处理**
   ```javascript
   try {
     const response = await util.request(...)
     if (response.statusCode === 200) {
       // 处理成功逻辑
     }
   } catch (error) {
     // 统一错误处理
   }
   ```

3. **添加请求日志**
   ```javascript
   console.log('✓ 请求成功，statusCode:', response.statusCode)
   console.log('返回数据:', response.data)
   ```

### ❌ DON'T（避免的做法）

1. **不要混用回调和 await**
   ```javascript
   // ❌ 错误示例
   const response = await wx.request({
     url: '...',
     success: (res) => { ... }  // 提供回调后 await 无效
   })
   ```

2. **不要在回调中 throw**
   ```javascript
   // ❌ 错误示例
   wx.request({
     ...,
     fail: (err) => {
       throw new Error('失败')  // 无法被外部捕获
     }
   })
   ```

3. **不要忽略错误处理**
   ```javascript
   // ❌ 错误示例
   util.request({ url }).then(res => console.log(res))
   // 没有 .catch() 处理错误
   ```

## 技术细节

### Promise封装原理

```javascript
function request(options) {
  return new Promise((resolve, reject) => {
    // 展开传入的 options 对象
    wx.request({
      ...options,        // 包含 url, data, method 等
      success: resolve,  // 成功时 resolve Promise
      fail: reject       // 失败时 reject Promise
    })
  })
}
```

### 为什么这样封装？

1. **保持 API 一致性**
   - 所有异步 API 都返回 Promise
   - 统一使用 async/await 语法

2. **更好的错误处理**
   - 错误可以通过 try-catch 捕获
   - 避免未处理的 Promise rejection

3. **代码更简洁**
   - 消除了回调嵌套
   - 异步代码看起来像同步代码

4. **兼容性更好**
   - 不依赖基础库的 Promise 实现
   - 在所有版本中行为一致

## 相关资源

- [微信小程序官方文档 - API](https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/api.html)
- [MDN - Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [Async/Aawait 最佳实践](https://javascript.info/async-await)

---

**最后更新**: 2026-03-09  
**作者**: AI Assistant  
**项目**: 故事书小程序
