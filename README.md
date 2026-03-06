# 故事书小程序

这是一个微信小程序项目。

## 快速开始

### 1. 安装微信开发者工具
下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

### 2. 导入项目
- 打开微信开发者工具
- 选择"导入项目"
- 选择本项目目录
- 填写你的小程序 AppID（在 project.config.json 中修改）

### 3. 开发配置
在 `project.config.json` 中修改以下配置：
- `appid`: 替换为你的小程序 AppID
- `projectname`: 项目名称

### 4. 运行项目
点击微信开发者工具的"编译"按钮即可预览

## 目录结构

```
storyBook/
├── app.js                 # 小程序入口
├── app.json              # 全局配置
├── app.wxss              # 全局样式
├── project.config.json   # 项目配置
├── sitemap.json          # 站点地图
└── pages/
    └── index/            # 首页
        ├── index.js
        ├── index.wxml
        ├── index.wxss
        └── index.json
```

## 开发文档
- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [微信开发者社区](https://developers.weixin.qq.com/community/)

## 许可证
MIT
