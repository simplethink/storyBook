---
name: data-sync-helper
version: 1.0.0
description: 小程序数据同步与备份助手
author: Assistant
tags: [data, sync, backup, storage, cloud]
---

# 数据同步与备份助手

## 功能描述
管理微信小程序的本地数据存储、云端同步、数据备份与恢复，支持自动同步和冲突解决。

## 使用方式

### 命令格式
```
操作类型：{{action}}
数据集合：{{collections}}
```

### 示例
- "帮我保存读书记录到本地"
- "同步所有数据到云端"
- "导出我的阅读数据做备份"
- "从云端加载最新的读书记录"
- "导入之前备份的数据"

## 支持的操作类型

### 1. Save - 保存数据到本地

**命令示例：**
```
保存数据：readingRecords
数据内容：[...]
```

**实现代码：**
```javascript
saveData(key, data) {
  try {
    wx.setStorageSync(STORAGE_KEYS[key], data);
    console.log(`💾 数据已保存：${key}`);
    
    // 如果启用了自动同步，触发云同步
    if (this.autoSync) {
      this.syncToCloud().catch(console.error);
    }
    
    return true;
  } catch (error) {
    console.error('❌ 保存数据失败:', error);
    return false;
  }
}
```

### 2. Load - 从本地加载数据

**命令示例：**
```
加载数据：reviewTasks
```

**实现代码：**
```javascript
getData(key) {
  try {
    const data = wx.getStorageSync(STORAGE_KEYS[key]);
    return data || [];
  } catch (error) {
    console.error('❌ 读取数据失败:', error);
    return [];
  }
}
```

### 3. Sync - 同步到云端

**命令示例：**
```
同步数据到云端
上传最近的更改
```

**实现流程：**

#### Step 1: 检查云开发环境
```javascript
if (!this.cloudEnabled) {
  console.log('☁️ 云同步未启用');
  return;
}
```

#### Step 2: 获取本地数据
```javascript
const localData = this.getData(collection);
```

#### Step 3: 分批上传到云数据库
```javascript
async syncToCloud() {
  try {
    const db = wx.cloud.database();
    const batchPromises = [];
    
    for (const collection of this.collections) {
      const localData = this.getData(collection);
      
      if (localData && localData.length > 0) {
        // 分批上传（每次最多 20 条）
        const batchSize = 20;
        for (let i = 0; i < localData.length; i += batchSize) {
          const batch = localData.slice(i, i + batchSize);
          
          const promise = db.collection(collection)
            .where({ _openid: '{{openid}}' })
            .update({
              data: {
                items: batch,
                updateTime: db.serverDate()
              }
            });
          
          batchPromises.push(promise);
        }
      }
    }
    
    await Promise.all(batchPromises);
    this.lastSyncTime = new Date();
    
    console.log('✅ 云端同步成功');
    return true;
  } catch (error) {
    console.error('❌ 云端同步失败:', error);
    return false;
  }
}
```

### 4. LoadFromCloud - 从云端加载

**命令示例：**
```
从云端下载数据
拉取最新数据
```

**实现代码：**
```javascript
async loadFromCloud() {
  if (!this.cloudEnabled) {
    console.log('☁️ 云同步未启用');
    return [];
  }
  
  try {
    const db = wx.cloud.database();
    const results = {};
    
    for (const collection of this.collections) {
      const res = await db.collection(collection)
        .where({ _openid: '{{openid}}' })
        .get();
      
      results[collection] = res.data[0]?.items || [];
    }
    
    // 保存到本地
    for (const [key, data] of Object.entries(results)) {
      this.saveData(key, data);
    }
    
    console.log('✅ 云端加载成功');
    return results;
  } catch (error) {
    console.error('❌ 云端加载失败:', error);
    return {};
  }
}
```

### 5. Export - 导出数据

**命令示例：**
```
导出所有数据
备份我的记录
生成数据备份文件
```

**实现代码：**
```javascript
exportData() {
  const exportObj = {};
  
  this.collections.forEach(key => {
    exportObj[key] = this.getData(key);
  });
  
  exportObj.exportTime = new Date().toISOString();
  exportObj.version = '1.0.0';
  exportObj.metadata = {
    totalRecords: this.getTotalCount(),
    appVersion: '1.0.0',
    platform: 'wechat-miniprogram'
  };
  
  return JSON.stringify(exportObj, null, 2);
}
```

**导出文件格式：**
```json
{
  "readingRecords": [...],
  "reviewTasks": [...],
  "exportTime": "2026-03-09T10:30:00.000Z",
  "version": "1.0.0",
  "metadata": {
    "totalRecords": 156,
    "appVersion": "1.0.0",
    "platform": "wechat-miniprogram"
  }
}
```

### 6. Import - 导入数据

**命令示例：**
```
导入备份文件
恢复之前的数据
从 JSON 文件加载
```

**实现代码：**
```javascript
importData(jsonString) {
  try {
    const importObj = JSON.parse(jsonString);
    
    for (const [key, data] of Object.entries(importObj)) {
      if (STORAGE_KEYS[key] && Array.isArray(data)) {
        this.saveData(key, data);
      }
    }
    
    console.log('✅ 数据导入成功');
    return true;
  } catch (error) {
    console.error('❌ 数据导入失败:', error);
    return false;
  }
}
```

## 支持的數據集合

### 1. readingRecords - 阅读记录

**数据结构：**
```javascript
{
  id: 'unique_id_123',
  bookName: '解忧杂货店',
  author: '[日] 东野圭吾',
  isbn: '9787550293427',
  coverImage: 'https://...',
  currentPage: 156,
  totalPages: 292,
  readTime: 45,  // 分钟
  notes: '今天读了第三章...',
  rating: 5,
  createTime: '2026-03-09T10:00:00.000Z',
  updateTime: '2026-03-09T10:30:00.000Z'
}
```

### 2. reviewTasks - 复习任务

**数据结构：**
```javascript
{
  id: 'task_456',
  bookId: 'book_123',
  bookName: '解忧杂货店',
  reviewContent: '复习第一章到第三章的内容',
  scheduledTime: '2026-03-10T10:00:00.000Z',
  completed: false,
  ebbinghausCycle: 2,  // 第几个复习周期
  priority: 'high',
  createTime: '2026-03-09T10:00:00.000Z'
}
```

## 自动同步配置

### 初始化配置
```javascript
const syncHelper = new DataSyncHelper({
  collections: ['readingRecords', 'reviewTasks'],
  autoSync: true,           // 启用自动同步
  syncInterval: 300000,     // 5 分钟同步一次
  cloudEnabled: true,       // 启用云同步
  conflictResolution: 'latest'  // 冲突解决策略
});

syncHelper.init();
```

### 启动自动同步
```javascript
startAutoSync() {
  if (this.syncTimer) {
    clearInterval(this.syncTimer);
  }
  
  this.syncTimer = setInterval(() => {
    console.log('⏰ 定时同步触发');
    this.syncToCloud().catch(console.error);
  }, this.syncInterval);
}
```

### 停止自动同步
```javascript
stopAutoSync() {
  if (this.syncTimer) {
    clearInterval(this.syncTimer);
    this.syncTimer = null;
  }
}
```

## 冲突解决策略

### 1. Latest Wins（最新获胜）
```javascript
conflictResolution: 'latest'

// 比较 updateTime，保留最新的
if (local.updateTime > cloud.updateTime) {
  return local;
} else {
  return cloud;
}
```

### 2. Manual Merge（手动合并）
```javascript
conflictResolution: 'manual'

// 提示用户选择
wx.showModal({
  title: '数据冲突',
  content: '本地和云端数据不一致，请选择保留版本',
  confirmText: '使用本地',
  cancelText: '使用云端',
  success: (res) => {
    if (res.confirm) {
      // 使用本地数据
    } else {
      // 使用云端数据
    }
  }
});
```

### 3. Smart Merge（智能合并）
```javascript
conflictResolution: 'smart'

// 基于 ID 合并，新增的记录都保留
const merged = [...cloudData];
localData.forEach(local => {
  const exists = merged.find(c => c.id === local.id);
  if (!exists) {
    merged.push(local);
  } else if (local.updateTime > exists.updateTime) {
    // 更新已存在的记录
    Object.assign(exists, local);
  }
});
```

## 统计信息

### 获取数据统计
```javascript
getStats() {
  const stats = {
    lastSyncTime: this.lastSyncTime,
    collections: {}
  };
  
  this.collections.forEach(key => {
    const data = this.getData(key);
    stats.collections[key] = {
      count: data.length,
      size: JSON.stringify(data).length,  // 字节数
      latestUpdate: data[data.length - 1]?.updateTime
    };
  });
  
  return stats;
}
```

### 统计信息展示
```
📊 数据统计
├─ readingRecords: 156 条记录 (256 KB)
├─ reviewTasks: 23 条记录 (12 KB)
└─ 上次同步：2026-03-09 10:30:00
```

## 小程序集成示例

### 页面中使用
```javascript
const DataSyncHelper = require('../../utils/dataSync');

Page({
  onReady() {
    // 初始化同步助手
    this.syncHelper = new DataSyncHelper({
      collections: ['readingRecords', 'reviewTasks'],
      autoSync: true
    }).init();
  },

  // 保存读书记录
  saveReadingRecord(record) {
    const records = this.syncHelper.getData('readingRecords');
    records.push(record);
    this.syncHelper.saveData('readingRecords', records);
  },

  // 手动触发同步
  manualSync() {
    wx.showLoading({ title: '同步中...' });
    
    this.syncHelper.syncToCloud()
      .then(success => {
        wx.hideLoading();
        if (success) {
          wx.showToast({ title: '同步成功', icon: 'success' });
        } else {
          wx.showModal({
            title: '同步失败',
            content: '请检查网络连接',
            showCancel: false
          });
        }
      });
  },

  // 导出数据
  exportData() {
    const jsonData = this.syncHelper.exportData();
    
    // 保存到手机
    wx.shareFileMessage({
      fileName: `reading_backup_${new Date().toISOString().split('T')[0]}.json`,
      filePath: jsonData
    });
  }
});
```

## 错误处理

### 常见错误及解决方案

**错误 1: 存储空间不足**
```
❌ 本地存储失败：存储空间已满
💡 请清理缓存或导出数据后重试
```

**错误 2: 网络不可用**
```
⚠️ 云端同步失败：网络不可用
💡 数据已保存到本地，网络恢复后会自动同步
```

**错误 3: 云开发未开通**
```
❌ 云同步需要开通微信云开发服务
💡 是否立即开通？
```

**错误 4: 数据格式错误**
```
❌ 导入失败：数据格式不正确
💡 请确保使用的是本应用导出的备份文件
```

## 最佳实践

### 1. 定期备份
- 每次重要操作后自动备份
- 每周提醒用户导出备份

### 2. 增量同步
- 只同步变化的数据
- 使用版本号或时间戳标记

### 3. 离线优先
- 优先保证本地可用
- 网络恢复后自动同步

### 4. 数据安全
- 敏感数据加密存储
- 导出文件添加密码保护

## 相关资源

- [微信小程序存储文档](https://developers.weixin.qq.com/miniprogram/dev/framework/ability/storage.html)
- [微信云开发数据库](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/database.html)
- [数据同步最佳实践](https://developers.weixin.qq.com/community/develop/mixflow)
