---
name: miniprogram-component
version: 1.0.0
description: 快速生成微信小程序页面模板
author: Assistant
tags: [miniprogram, wechat, component, generator]
---

# 小程序页面生成器

## 功能描述
快速生成符合微信小程序规范的页面文件，包括 WXML、WXSS、JS 和 JSON 配置文件。

## 使用方式

### 命令格式
```
生成一个小程序页面：{{pageName}}
```

### 示例
- "生成一个小程序页面：bookDetail"
- "创建一个新的页面：reviewList"
- "帮我添加一个页面：userProfile"

## 输出要求

当用户请求创建小程序页面时，请按照以下结构生成代码：

### 1. WXML 文件 ({{pageName}}.wxml)
```xml
<view class="{{pageName}}-container">
  <view class="{{pageName}}-content">
    <!-- TODO: Add your content here -->
  </view>
</view>
```

### 2. WXSS 文件 ({{pageName}}.wxss)
```css
.{{pageName}}-container {
  min-height: 100vh;
  padding: 20rpx;
}

.{{pageName}}-content {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
}
```

### 3. JS 文件 ({{pageName}}.js)
```javascript
Page({
  data: {
    
  },

  onLoad(options) {
    // TODO: Page initialization
  },

  onReady() {
    // TODO: Page ready
  },

  onShow() {
    // TODO: Page show
  },

  onHide() {
    // TODO: Page hide
  },

  onUnload() {
    // TODO: Page unload
  },

  onPullDownRefresh() {
    // TODO: Pull down refresh
  },

  onReachBottom() {
    // TODO: Reach bottom
  },

  onShareAppMessage() {
    return {
      title: '{{pageName}}',
      path: '/pages/{{pageName}}/{{pageName}}'
    }
  }
})
```

### 4. JSON 文件 ({{pageName}}.json)
```json
{
  "usingComponents": {},
  "navigationBarTitleText": "{{pageName}}"
}
```

## 设计规范

1. **布局风格**：简洁的卡片式设计
2. **颜色主题**：与项目整体风格保持一致（紫色渐变系）
3. **单位使用**：使用 rpx 作为尺寸单位
4. **注释规范**：关键位置添加 TODO 注释
5. **命名规范**：遵循微信小程序命名约定

## 注意事项

- 确保页面名称符合小程序命名规范（小写字母开头，驼峰命名）
- 自动生成完整的生命周期函数
- 包含必要的错误处理和边界情况
- 遵循微信官方开发文档的最佳实践

## 相关文件

- 页面路径：`/pages/{{pageName}}/{{pageName}}.*`
- 需要在 `app.json` 中注册新页面
