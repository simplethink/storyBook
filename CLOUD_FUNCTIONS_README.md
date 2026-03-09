# 云函数说明文档

## 📦 云函数列表

### 1. getUserInfo - 获取用户信息

**功能:** 获取并保存用户的微信昵称、头像等信息到云端

**调用方式:**
```javascript
wx.cloud.callFunction({
  name: 'getUserInfo',
  data: {
    nickName: '用户昵称',
    avatarUrl: '头像 URL',
    gender: 0,
    city: '城市',
    province: '省份',
    country: '国家'
  }
})
```

**返回结果:**
```javascript
{
  success: true,
  message: '用户信息创建/更新成功',
  data: {
    openid: 'xxx',
    nickName: '用户昵称',
    avatarUrl: '头像 URL'
  }
}
```

**使用场景:**
- 用户首次登录时保存信息
- 用户更新头像或昵称时

---

### 2. syncReadingRecords - 同步读书记录

**功能:** 双向同步读书记录（上传/下载/删除）

**调用方式:**

#### 上传记录
```javascript
wx.cloud.callFunction({
  name: 'syncReadingRecords',
  data: {
    action: 'upload',
    records: [{
      bookName: '书名',
      author: '作者',
      date: '阅读日期',
      startTime: '开始时间',
      endTime: '结束时间',
      readingTime: '时间段',
      startPage: 10,
      endPage: 50,
      duration: 60,
      note: '笔记',
      coverUrl: '封面图',
      createTime: Date.now()
    }]
  }
})
```

#### 下载记录
```javascript
wx.cloud.callFunction({
  name: 'syncReadingRecords',
  data: {
    action: 'download'
    // 可选参数: startDate, endDate
  }
})
```

#### 删除记录
```javascript
wx.cloud.callFunction({
  name: 'syncReadingRecords',
  data: {
    action: 'delete',
    recordId: '记录 ID'
  }
})
```

**返回结果:**
```javascript
// 上传成功
{
  success: true,
  message: '成功同步 1 条记录',
  data: [...]
}

// 下载成功
{
  success: true,
  data: [...],  // 记录数组
  total: 10     // 总数
}
```

---

### 3. syncReviewTasks - 同步复习任务

**功能:** 双向同步复习任务（上传/下载/更新/删除/自动生成）

**调用方式:**

#### 上传任务
```javascript
wx.cloud.callFunction({
  name: 'syncReviewTasks',
  data: {
    action: 'upload',
    tasks: [{
      bookName: '书名',
      readDate: '阅读日期',
      reviewDate: '复习日期',
      stage: 1,  // 1-5，艾宾浩斯复习阶段
      completed: false,
      createTime: Date.now()
    }]
  }
})
```

#### 下载任务
```javascript
wx.cloud.callFunction({
  name: 'syncReviewTasks',
  data: {
    action: 'download'
    // 可选参数：startDate, endDate
  }
})
```

#### 更新任务状态
```javascript
wx.cloud.callFunction({
  name: 'syncReviewTasks',
  data: {
    action: 'update',
    taskId: '任务 ID',
    completed: true,
    completedTime: Date.now()
  }
})
```

#### 删除任务
```javascript
wx.cloud.callFunction({
  name: 'syncReviewTasks',
  data: {
    action: 'delete',
    taskId: '任务 ID'
  }
})
```

#### 自动生成复习任务
```javascript
wx.cloud.callFunction({
  name: 'syncReviewTasks',
  data: {
    action: 'generateReviews',
    readRecord: {
      bookName: '书名',
      date: '阅读日期',
      author: '作者'
    }
  }
})
```

**返回结果:**
```javascript
// 生成复习任务成功
{
  success: true,
  message: '成功生成 5 个复习任务',
  data: [
    {
      _id: 'xxx',
      bookName: '书名',
      readDate: '2026-03-09',
      reviewDate: '2026-03-10',  // 1 天后
      stage: 1,
      completed: false
    },
    {
      _id: 'xxx',
      bookName: '书名',
      readDate: '2026-03-09',
      reviewDate: '2026-03-11',  // 2 天后
      stage: 2,
      completed: false
    }
    // ... 4 天、7 天、15 天后
  ]
}
```

---

## 🔧 封装的便捷方法

在 `app.js` 中已经封装了便捷的调用方法：

### 获取用户信息
```javascript
const app = getApp()
app.getUserInfo((userInfo) => {
  if (userInfo) {
    console.log('用户信息:', userInfo)
  }
})
```

### 同步读书记录
```javascript
const app = getApp()
app.syncReadingRecords('upload', [recordData], (result) => {
  if (result.success) {
    console.log('同步成功')
  }
})
```

### 同步复习任务
```javascript
const app = getApp()
app.syncReviewTasks('upload', [taskData], (result) => {
  if (result.success) {
    console.log('同步成功')
  }
})
```

---

## 📝 使用示例

### 完整流程示例

#### 1. 用户登录
```javascript
// pages/login/login.js
getUserProfile() {
  wx.getUserProfile({
    desc: '用于完善用户资料',
    success: (res) => {
      const userInfo = res.userInfo
      
      // 保存到本地和全局
      wx.setStorageSync('userInfo', userInfo)
      getApp().globalData.userInfo = userInfo
      
      // 保存到云端
      wx.cloud.callFunction({
        name: 'getUserInfo',
        data: {
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          gender: userInfo.gender,
          city: userInfo.city,
          province: userInfo.province,
          country: userInfo.country
        }
      })
    }
  })
}
```

#### 2. 添加读书记录并同步
```javascript
// pages/editRecord/editRecord.js
saveRecord() {
  const record = {
    bookName: this.data.bookName,
    date: new Date().toDateString(),
    startTime: this.data.startTime,
    endTime: this.data.endTime,
    duration: this.data.duration,
    note: this.data.note
  }
  
  // 保存到本地
  const allRecords = wx.getStorageSync('readingRecords') || {}
  if (!allRecords[record.date]) {
    allRecords[record.date] = []
  }
  allRecords[record.date].push(record)
  wx.setStorageSync('readingRecords', allRecords)
  
  // 同步到云端
  const app = getApp()
  app.syncReadingRecords('upload', [record], (result) => {
    if (result.success) {
      wx.showToast({ title: '保存成功' })
      
      // 如果开启自动生成复习，则生成复习任务
      if (app.globalData.autoGenerateReview) {
        app.syncReviewTasks('generateReviews', null, {
          readRecord: record
        })
      }
    }
  })
}
```

#### 3. 完成复习任务
```javascript
// pages/recordDetail/recordDetail.js
completeTask(taskId) {
  const app = getApp()
  app.syncReviewTasks('update', null, {
    action: 'update',
    taskId: taskId,
    completed: true,
    completedTime: Date.now()
  }, (result) => {
    if (result.success) {
      wx.showToast({ 
        title: '已完成',
        icon: 'success'
      })
      this.loadTodayData() // 刷新数据
    }
  })
}
```

---

## ⚠️ 注意事项

1. **云函数部署**: 
   - 在微信开发者工具中右键点击云函数目录
   - 选择"上传并部署：云端安装依赖"
   - 确保每个云函数都部署成功

2. **数据库集合创建**:
   - 参考 `CLOUD_DATABASE_GUIDE.md` 创建集合
   - 设置正确的权限和索引

3. **网络错误处理**:
   - 所有云函数调用都应该有 fail 回调
   - 网络失败时要有友好的提示

4. **数据一致性**:
   - 本地操作优先，保证用户体验
   - 后台静默同步到云端
   - 冲突时以最新时间为准

5. **性能优化**:
   - 避免频繁调用云函数
   - 可以批量操作时使用 batchUpload
   - 定期清理无用数据

---

## 🎯 后续优化建议

1. **离线队列**: 实现离线操作队列，网络恢复后自动同步
2. **增量同步**: 只同步变化的数据，减少流量消耗
3. **冲突解决**: 更智能的冲突检测和解决机制
4. **数据校验**: 云端增加数据格式校验
5. **错误重试**: 失败自动重试机制
6. **加载状态**: 显示同步进度和状态
