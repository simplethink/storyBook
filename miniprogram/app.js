// app.js
App({
  onLaunch: function () {
    this.globalData = {
      // env 参数说明：
      // env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会请求到哪个云环境的资源
      // 此处请填入环境 ID, 环境 ID 可在微信开发者工具右上顶部工具栏点击云开发按钮打开获取
      env: "cloud1-0gu9re7s846e6224",
      userInfo: null,
      hasLogin: false,
      autoGenerateReview: true // 默认开启自动生成复习任务
    };
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
    }
    console.log('小程序启动');
    
    // 检查本地是否有用户信息
    const localUserInfo = wx.getStorageSync('userInfo');
    if (localUserInfo) {
      this.globalData.userInfo = localUserInfo;
      this.globalData.hasLogin = true;
    }
  },
  
  // 获取用户信息
  getUserInfo: function(callback) {
    const that = this;
    if (this.globalData.userInfo && this.globalData.hasLogin) {
      typeof callback == 'function' && callback(this.globalData.userInfo);
    } else {
      // 调用云函数获取 openid
      wx.cloud.callFunction({
        name: 'getUserInfo',
        data: {},
        success: res => {
          console.log('云函数获取用户信息成功', res.result);
          if (res.result.success) {
            that.globalData.userInfo = res.result.data;
            that.globalData.hasLogin = true;
            wx.setStorageSync('userInfo', res.result.data);
            typeof callback == 'function' && callback(res.result.data);
          }
        },
        fail: err => {
          console.error('云函数获取用户信息失败', err);
          typeof callback == 'function' && callback(null);
        }
      });
    }
  },
  
  // 同步读书记录到云端
  syncReadingRecords: function(action, records, callback) {
    wx.cloud.callFunction({
      name: 'syncReadingRecords',
      data: {
        action: action,
        records: records
      },
      success: res => {
        console.log('同步读书记录成功', res.result);
        typeof callback == 'function' && callback(res.result);
      },
      fail: err => {
        console.error('同步读书记录失败', err);
        typeof callback == 'function' && callback({ success: false, errMsg: err.errMsg });
      }
    });
  },
  
  // 从云端下载读书记录
  downloadReadingRecords: function(startDate, endDate, callback) {
    wx.cloud.callFunction({
      name: 'syncReadingRecords',
      data: {
        action: 'download',
        startDate: startDate,
        endDate: endDate
      },
      success: res => {
        console.log('下载读书记录成功', res.result);
        if (res.result.success) {
          // 合并到本地存储
          const localRecords = this.mergeReadingRecords(res.result.data);
          typeof callback == 'function' && callback({ success: true, data: localRecords });
        } else {
          typeof callback == 'function' && callback(res.result);
        }
      },
      fail: err => {
        console.error('下载读书记录失败', err);
        typeof callback == 'function' && callback({ success: false, errMsg: err.errMsg });
      }
    });
  },
  
  // 合并读书记录到本地
  mergeReadingRecords: function(cloudRecords) {
    const localRecords = wx.getStorageSync('readingRecords') || {};
    
    cloudRecords.forEach(record => {
      const date = record.date;
      if (!localRecords[date]) {
        localRecords[date] = [];
      }
      
      // 检查是否已存在（避免重复）
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
  },
  
  // 同步复习任务到云端
  syncReviewTasks: function(action, tasks, callback) {
    wx.cloud.callFunction({
      name: 'syncReviewTasks',
      data: {
        action: action,
        tasks: tasks
      },
      success: res => {
        console.log('同步复习任务成功', res.result);
        typeof callback == 'function' && callback(res.result);
      },
      fail: err => {
        console.error('同步复习任务失败', err);
        typeof callback == 'function' && callback({ success: false, errMsg: err.errMsg });
      }
    });
  },
  
  // 从云端下载复习任务
  downloadReviewTasks: function(startDate, endDate, callback) {
    wx.cloud.callFunction({
      name: 'syncReviewTasks',
      data: {
        action: 'download',
        startDate: startDate,
        endDate: endDate
      },
      success: res => {
        console.log('下载复习任务成功', res.result);
        if (res.result.success) {
          // 合并到本地存储
          const localTasks = this.mergeReviewTasks(res.result.data);
          typeof callback == 'function' && callback({ success: true, data: localTasks });
        } else {
          typeof callback == 'function' && callback(res.result);
        }
      },
      fail: err => {
        console.error('下载复习任务失败', err);
        typeof callback == 'function' && callback({ success: false, errMsg: err.errMsg });
      }
    });
  },
  
  // 合并复习任务到本地
  mergeReviewTasks: function(cloudTasks) {
    const localTasks = wx.getStorageSync('reviewTasks') || {};
    
    cloudTasks.forEach(task => {
      const reviewDate = task.reviewDate;
      if (!localTasks[reviewDate]) {
        localTasks[reviewDate] = [];
      }
      
      // 检查是否已存在（避免重复）
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
  },
});
