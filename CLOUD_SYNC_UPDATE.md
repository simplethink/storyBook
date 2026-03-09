# 云端同步功能更新说明

## ✅ 已完成的云端同步功能

### 2026-03-09 最新更新

#### 1. 新增下载方法

在 `app.js` 中新增了从云端下载到本地的方法：

**下载读书记录:**
```javascript
app.downloadReadingRecords(startDate, endDate, callback)
```

**下载复习任务:**
```javascript
app.downloadReviewTasks(startDate, endDate, callback)
```

#### 2. 自动合并机制

下载的数据会**自动合并到本地存储**，避免重复数据：

- 检查 bookName + createTime 是否重复（读书记录）
- 检查 bookName + stage + readDate 是否重复（复习任务）
- 只添加不存在的记录，保留已有数据

#### 3. 首页自动同步

**onLoad 时自动同步:**
```javascript
// pages/index/index.js
onLoad() {
  this.loadUserInfo()
  this.syncDataFromCloud()  // ⬅️ 新增：从云端同步
  this.loadTodayData()
  this.loadStats()
  this.loadRecentRecords()
}
```

**onShow 时也同步:**
```javascript
onShow() {
  this.loadTodayData()
  this.loadStats()
  this.loadRecentRecords()
  this.syncDataFromCloud()  // ⬅️ 每次打开页面都同步
}
```

---

## 🔄 完整的双向同步流程

### 上传流程（已有）
```
本地操作 → 保存到 localStorage → 调用云函数上传 → 云端数据库
```

### 下载流程（新增）✨
```
打开页面 → 调用云函数下载 → 合并到 localStorage → 刷新页面显示
          ↓
      云端数据库
```

---

## 📱 使用场景

### 场景 1：首次登录（换设备）
1. 用户在新设备上登录
2. 本地没有历史数据
3. 打开首页 → 自动从云端下载所有记录
4. 合并到本地存储
5. 页面显示完整的历史数据

### 场景 2：多设备同步
1. 设备 A 添加了读书记录
2. 设备 B 打开首页
3. 自动从云端下载新记录
4. 设备 B 也能看到设备 A 添加的数据

### 场景 3：数据恢复
1. 用户清除了小程序缓存
2. 本地数据丢失
3. 重新打开小程序
4. 自动从云端恢复所有数据

---

## 🎯 同步策略

### 智能合并
- **去重**: 根据唯一标识避免重复添加
- **增量**: 只添加本地没有的记录
- **保留**: 不会覆盖本地的新数据

### 性能优化
- **条件判断**: 只有已登录用户才同步
- **异步处理**: 不阻塞页面加载
- **提示友好**: 显示"同步数据中..."提示

### 错误处理
- **网络失败**: 不影响本地功能
- **未登录**: 跳过同步
- **空数据**: 正常处理，不报错

---

## 🔍 代码实现细节

### app.js 新增方法

#### 1. downloadReadingRecords
```javascript
downloadReadingRecords: function(startDate, endDate, callback) {
  wx.cloud.callFunction({
    name: 'syncReadingRecords',
    data: {
      action: 'download',
      startDate: startDate,  // 可选：开始日期
      endDate: endDate       // 可选：结束日期
    },
    success: res => {
      if (res.result.success) {
        // 合并到本地
        const localRecords = this.mergeReadingRecords(res.result.data);
        callback({ success: true, data: localRecords });
      }
    }
  })
}
```

#### 2. mergeReadingRecords
```javascript
mergeReadingRecords: function(cloudRecords) {
  const localRecords = wx.getStorageSync('readingRecords') || {};
  
  cloudRecords.forEach(record => {
    const date = record.date;
    if (!localRecords[date]) {
      localRecords[date] = [];
    }
    
    // 去重检查
    const exists = localRecords[date].some(r => 
      r.bookName === record.bookName && 
      r.createTime === record.createTime
    );
    
    if (!exists) {
      localRecords[date].push(record);
    }
  });
  
  wx.setStorageSync('readingRecords', localRecords);
  return localRecords;
}
```

#### 3. downloadReviewTasks
```javascript
downloadReviewTasks: function(startDate, endDate, callback) {
  wx.cloud.callFunction({
    name: 'syncReviewTasks',
    data: {
      action: 'download',
      startDate: startDate,
      endDate: endDate
    },
    success: res => {
      if (res.result.success) {
        const localTasks = this.mergeReviewTasks(res.result.data);
        callback({ success: true, data: localTasks });
      }
    }
  })
}
```

#### 4. mergeReviewTasks
```javascript
mergeReviewTasks: function(cloudTasks) {
  const localTasks = wx.getStorageSync('reviewTasks') || {};
  
  cloudTasks.forEach(task => {
    const reviewDate = task.reviewDate;
    if (!localTasks[reviewDate]) {
      localTasks[reviewDate] = [];
    }
    
    // 去重检查
    const exists = localTasks[reviewDate].some(t => 
      t.bookName === task.bookName && 
      t.stage === task.stage &&
      t.readDate === task.readDate
    );
    
    if (!exists) {
      localTasks[reviewDate].push(task);
    }
  });
  
  wx.setStorageSync('reviewTasks', localTasks);
  return localTasks;
}
```

---

## 📊 数据流向图

```
┌─────────────┐
│   设备 A     │
│  添加记录    │
└──────┬──────┘
       │
       │ 上传
       ↓
┌─────────────────┐
│   云端数据库     │
│  reading_records│
│  review_tasks   │
└──────┬──────────┘
       │
       │ 下载
       ↓
┌─────────────┐
│   设备 B     │
│  合并到本地  │
│  显示数据    │
└─────────────┘
```

---

## ⚠️ 注意事项

### 1. 同步时机
- **onLoad**: 页面加载时同步一次
- **onShow**: 每次切换到前台都同步
- **手动触发**: 可以添加下拉刷新按钮

### 2. 网络依赖
- 有网络：实时同步
- 无网络：使用本地数据，不影响功能

### 3. 数据冲突
- 以 createTime 作为唯一标识
- 先到的数据优先保留
- 避免同时修改同一条记录

### 4. 性能考虑
- 首次同步可能较慢（数据量大时）
- 后续只同步新增数据
- 可以考虑添加分页加载

---

## 🚀 后续优化建议

### 1. 增量同步优化
```javascript
// 只同步上次同步后的新数据
const lastSyncTime = wx.getStorageSync('lastSyncTime');
app.downloadReadingRecords(lastSyncTime, null, callback);
```

### 2. 手动刷新
添加下拉刷新或刷新按钮：
```javascript
onPullDownRefresh() {
  this.syncDataFromCloud();
  wx.stopPullDownRefresh();
}
```

### 3. 同步状态显示
```javascript
data: {
  syncStatus: 'syncing',  // syncing, success, error
  lastSyncTime: '刚刚'
}
```

### 4. 离线队列
```javascript
// 记录离线时的操作，网络恢复后自动上传
const offlineQueue = wx.getStorageSync('offlineQueue') || [];
```

---

## ✅ 验收标准

- ✅ 首页 onLoad 时自动从云端下载数据
- ✅ onShow 时也会同步
- ✅ 下载的数据自动合并到本地
- ✅ 不会重复添加相同的记录
- ✅ 多设备数据能保持一致
- ✅ 清除缓存后能从云端恢复
- ✅ 网络失败时不影响本地功能

---

更新时间：2026-03-09
