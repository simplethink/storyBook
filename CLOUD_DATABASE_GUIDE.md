# 云开发数据库配置指南

## 📋 需要创建的数据库集合

### 1. users 集合
用户信息集合

**字段说明:**
- `_id`: 自动生成的唯一标识符
- `openid`: 用户的 openid (微信返回)
- `nickName`: 用户昵称
- `avatarUrl`: 用户头像 URL
- `gender`: 性别 (0-未知，1-男，2-女)
- `city`: 城市
- `province`: 省份
- `country`: 国家
- `createTime`: 创建时间戳
- `updateTime`: 更新时间戳

**索引设置:**
- `openid`: 建立唯一索引

**权限设置:**
```json
{
  "read": "auth.openid == doc.openid",
  "write": "auth.openid == doc.openid"
}
```

---

### 2. reading_records 集合
读书记录集合

**字段说明:**
- `_id`: 自动生成的唯一标识符
- `openid`: 用户的 openid
- `bookName`: 书名
- `author`: 作者
- `isbn`: ISBN 编号
- `coverUrl`: 封面图片 URL
- `date`: 阅读日期 (字符串格式，如 "Mon Mar 09 2026")
- `startTime`: 开始时间 (如 "20:00")
- `endTime`: 结束时间 (如 "21:30")
- `readingTime`: 阅读时间段 (如 "20:00-21:30")
- `startPage`: 起始页码
- `endPage`: 结束页码
- `duration`: 阅读时长 (分钟)
- `note`: 笔记/感想
- `createTime`: 创建时间戳

**索引设置:**
- `openid`: 建立索引
- `date`: 建立索引
- `openid + date`: 建立复合索引

**权限设置:**
```json
{
  "read": "auth.openid == doc.openid",
  "write": "auth.openid == doc.openid"
}
```

---

### 3. review_tasks 集合
复习任务集合

**字段说明:**
- `_id`: 自动生成的唯一标识符
- `openid`: 用户的 openid
- `bookName`: 书名
- `author`: 作者
- `readDate`: 阅读日期
- `reviewDate`: 复习日期
- `stage`: 复习阶段 (1-5,对应艾宾浩斯复习周期)
- `completed`: 是否已完成 (布尔值)
- `completedTime`: 完成时间戳
- `createTime`: 创建时间戳
- `updateTime`: 更新时间戳

**索引设置:**
- `openid`: 建立索引
- `reviewDate`: 建立索引
- `openid + reviewDate`: 建立复合索引
- `openid + completed`: 建立复合索引

**权限设置:**
```json
{
  "read": "auth.openid == doc.openid",
  "write": "auth.openid == doc.openid"
}
```

---

## 🚀 如何在微信开发者工具中创建

### 方法一：通过云开发控制台手动创建

1. 打开微信开发者工具
2. 点击顶部工具栏的「云开发」按钮
3. 进入云开发控制台
4. 点击「数据库」标签
5. 点击「+」创建集合
6. 分别创建 `users`、`reading_records`、`review_tasks` 三个集合
7. 为每个集合设置上述权限和索引

### 方法二：使用云函数自动创建

已有一个 quickstartFunctions 云函数包含 createCollection 功能，可以修改它来创建所需的集合。

在云函数中调用:
```javascript
wx.cloud.callFunction({
  name: 'quickstartFunctions',
  data: {
    type: 'createCollection'
  }
})
```

或者单独创建一个初始化云函数 `initDatabase`。

---

## 📝 数据同步策略

### 首次登录
1. 检查本地是否有数据
2. 如果有本地数据，上传到云端
3. 如果云端有数据（换设备），下载到本地
4. 冲突处理：以最新时间为准

### 日常使用
1. 本地操作优先（保证响应速度）
2. 每次添加/修改记录后，自动同步到云端
3. 定期（如每天首次打开）从云端拉取最新数据
4. 网络失败时，暂存本地，等待网络恢复后重试

---

## 🔒 安全规则

所有集合都应设置访问权限为：**用户只能访问自己的数据**

```json
{
  "read": "auth.openid == doc.openid",
  "write": "auth.openid == doc.openid"
}
```

这样可以确保：
- 用户只能查看自己的数据
- 用户只能修改自己的数据
- 不同用户之间的数据完全隔离

---

## 💡 使用建议

1. **定期备份**: 虽然云开发有高可用保障，但建议定期导出重要数据
2. **监控用量**: 在云开发控制台监控数据库读写量，避免超出免费额度
3. **优化查询**: 合理使用索引，避免全表扫描
4. **数据清理**: 对于测试数据或不需要的数据，及时清理节省空间

---

## 📊 数据库操作示例

### 添加读书记录
```javascript
wx.cloud.callFunction({
  name: 'syncReadingRecords',
  data: {
    action: 'upload',
    records: [{
      bookName: '小王子',
      author: '安托万·德·圣 - 埃克苏佩里',
      date: new Date().toDateString(),
      startTime: '20:00',
      endTime: '21:00',
      readingTime: '20:00-21:00',
      startPage: 10,
      endPage: 50,
      duration: 60,
      note: '很好的书',
      createTime: Date.now()
    }]
  }
})
```

### 获取所有读书记录
```javascript
wx.cloud.callFunction({
  name: 'syncReadingRecords',
  data: {
    action: 'download'
  }
})
```

### 生成复习任务
```javascript
wx.cloud.callFunction({
  name: 'syncReviewTasks',
  data: {
    action: 'generateReviews',
    readRecord: {
      bookName: '小王子',
      date: new Date().toDateString()
    }
  }
})
```
