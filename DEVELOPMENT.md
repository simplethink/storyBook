# 项目开发文档 📝

## 重要配置说明

### 1. 小程序 AppID 配置
在 `project.config.json` 中修改 appid：
```json
{
  "appid": "wxb1234567890abcde"  // 替换为你的真实 AppID
}
```

获取 AppID 步骤：
1. 访问 https://mp.weixin.qq.com/
2. 注册微信小程序账号
3. 登录后在"开发" -> "开发管理" -> "开发设置" 中找到 AppID

### 2. 豆瓣 API Key 配置（可选）
如需使用豆瓣 API 获取图书信息，在 `utils/bookApi.js` 中配置：
```javascript
const apiKey = 'YOUR_DOUBAN_API_KEY'  // 替换为你的豆瓣 API Key
```

申请豆瓣 API Key：
1. 访问 https://developers.douban.com/
2. 注册并创建应用
3. 获取 API Key

### 3. 服务器域名配置
如果使用云开发或第三方 API，需要在微信公众平台配置服务器域名：
- 登录小程序后台
- 开发 -> 开发管理 -> 开发设置 -> 服务器域名
- 添加 request 合法域名：
  - https://www.googleapis.com
  - https://openlibrary.org

## 功能使用说明

### 扫码功能
- 需要用户授权相机权限
- 支持扫描 ISBN-13 条形码
- 自动调用图书 API 获取信息

### 拍照上传
- 支持从相册选择或相机拍摄
- 图片会自动压缩
- 本地存储，不上传服务器

### 复习提醒
- 保存记录时自动生成 5 个复习任务
- 复习周期：1 天、2 天、4 天、7 天、15 天
- 可在日历上查看待复习标记

## 数据存储结构

### readingRecords（阅读记录）
```javascript
{
  "Fri Mar 06 2026": [  // 日期字符串
    {
      "id": "1709721234567_abc123",  // 唯一 ID
      "coverUrl": "tempFilePath",    // 封面图片路径
      "bookName": "书名",
      "author": "作者",
      "isbn": "9787121000000",
      "startPage": 1,
      "endPage": 50,
      "duration": 30,  // 分钟
      "note": "读书笔记...",
      "createTime": 1709721234567,
      "updateTime": 1709721234567
    }
  ]
}
```

### reviewTasks（复习任务）
```javascript
{
  "Sat Mar 07 2026": [  // 复习日期
    {
      "id": "1709721234567_def456",
      "bookName": "书名",
      "stage": 1,  // 第几次复习
      "completed": false,
      "note": "",
      "createTime": 1709721234567
    }
  ]
}
```

## 常见问题

### Q: 扫码后获取不到图书信息？
A: 
1. 检查网络连接
2. 更换其他 API 源（代码会自动尝试多个 API）
3. 手动输入图书信息

### Q: 如何清空数据？
A: 
在微信开发者工具中：
1. 点击"调试器"
2. 选择"Storage"标签
3. 删除 readingRecords 和 reviewTasks

或在代码中执行：
```javascript
wx.removeStorageSync('readingRecords')
wx.removeStorageSync('reviewTasks')
```

### Q: 如何备份数据？
A: 
方法 1：导出 JSON
```javascript
const data = {
  records: wx.getStorageSync('readingRecords'),
  tasks: wx.getStorageSync('reviewTasks')
}
console.log(JSON.stringify(data))
```

方法 2：使用微信云开发实现云端同步

### Q: 图片上传失败？
A: 
1. 检查是否授权相册/相机权限
2. 图片大小不能超过 10MB
3. 确保是支持的格式（jpg、png）

## 开发技巧

### 调试技巧
1. 使用微信开发者工具的"调试器"查看 Console 日志
2. 使用 Storage 面板查看本地存储数据
3. 使用 Wxml 面板查看页面结构

### 性能优化
1. 图片使用 compressed 质量
2. 避免过多的 setData 调用
3. 使用防抖处理频繁操作

### 代码规范
1. 遵循微信小程序开发规范
2. 使用 ESLint 检查代码
3. 注释清晰，变量命名规范

## 扩展功能建议

### 1. 云开发集成
```javascript
// 初始化云开发
wx.cloud.init({
  env: 'your-env-id'
})

// 保存到云数据库
wx.cloud.database().collection('records').add({
  data: { ... }
})
```

### 2. 分享功能
```javascript
// 分享到朋友圈
onShareTimeline() {
  return {
    title: '我的读书记录',
    query: 'date=xxx'
  }
}

// 分享给朋友
onShareAppMessage() {
  return {
    title: '我的读书记录',
    path: '/pages/index/index'
  }
}
```

### 3. 订阅消息提醒
```javascript
// 请求订阅
wx.requestSubscribeMessage({
  tmplIds: ['TEMPLATE_ID'],
  success(res) {
    // 发送订阅消息
  }
})
```

## 更新日志

### v1.0.0 (2026-03-06)
- ✅ 初始版本发布
- ✅ 日历视图功能
- ✅ 读书记录管理
- ✅ 扫码和拍照功能
- ✅ 艾宾浩斯复习提醒
- ✅ 数据统计展示

---

**技术支持**: StoryBook Development Team  
**文档版本**: 1.0.0
