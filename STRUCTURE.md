# 项目目录结构说明

## ✅ 已改造为官方推荐的子目录结构

### 新的目录结构：

```
storyBook/
├── miniprogram/              # 小程序代码目录
│   ├── pages/               # 页面文件
│   │   ├── index/          # 首页
│   │   ├── calendar/       # 日历页
│   │   ├── recordDetail/   # 记录详情页
│   │   ├── editRecord/     # 编辑记录页
│   │   ├── addReviewTask/  # 添加复习任务页
│   │   ├── viewRecord/     # 查看记录页
│   │   └── settings/       # 设置页
│   ├── utils/              # 工具类
│   │   ├── util.js
│   │   └── bookApi.js
│   ├── app.js              # 小程序入口
│   ├── app.json            # 小程序配置
│   ├── app.wxss            # 全局样式
│   └── sitemap.json        # 搜索索引配置
├── cloudfunctions/         # 云函数目录
│   └── getOpenid/         # 获取 openid 云函数
│       ├── index.js       # 云函数入口
│       ├── config.json    # 权限配置
│       ├── package.json   # 依赖配置
│       └── node_modules/  # 依赖包（已安装）
├── .cloudbaserc.json      # 云开发基础配置
├── project.config.json    # 项目配置
└── project.private.config.json
```

---

## 📋 关键配置说明

### 1. project.config.json
```json
{
  "miniprogramRoot": "miniprogram/",      // 小程序代码根目录
  "cloudFunctionRoot": "cloudfunctions/"  // 云函数根目录
}
```

### 2. .cloudbaserc.json
```json
{
  "version": "2.0",
  "envId": "cloud1-0gu9re7s846e6224",
  "functionRoot": "../cloudfunctions/"  // 相对于 miniprogram 的云函数路径
}
```

---

## 🚀 使用步骤

### 步骤 1：重新导入项目
1. 关闭微信开发者工具中的当前项目
2. 重新导入项目，选择目录：`/Users/qihao/Documents/workspace/storyBook`
3. 工具会自动识别 `miniprogram/` 为小程序代码目录

### 步骤 2：验证云开发识别
- 查看顶部工具栏是否出现 **「云开发」** 按钮
- 查看左侧文件树中云函数文件夹是否有特殊图标

### 步骤 3：构建 npm
1. 点击顶部菜单 **「工具」** → **「构建 npm」**
2. 等待构建完成

### 步骤 4：上传云函数
1. 在左侧文件树找到 `cloudfunctions/getOpenid` 文件夹
2. 右键点击文件夹
3. 选择 **「上传并部署：云端安装依赖」**
4. 等待上传完成

---

## 🔍 验证清单

### 项目结构验证
- ✅ `miniprogram/` 目录包含所有小程序代码
- ✅ `cloudfunctions/` 目录包含云函数代码
- ✅ 根目录有 `.cloudbaserc.json` 文件
- ✅ 根目录有 `project.config.json` 文件

### 配置验证
- ✅ `project.config.json` 中 `miniprogramRoot: "miniprogram/"`
- ✅ `project.config.json` 中 `cloudFunctionRoot: "cloudfunctions/"`
- ✅ `.cloudbaserc.json` 中 `functionRoot: "../cloudfunctions/"`
- ✅ `miniprogram/app.json` 中 `"cloud": true`

### 功能验证
- ✅ 云函数依赖已安装（node_modules 存在）
- ✅ app.js 中初始化了云开发环境
- ✅ app.js 中配置了正确的环境 ID

---

## 💡 为什么要使用子目录结构？

### 优势：
1. **官方推荐** - 符合微信官方项目规范
2. **清晰分离** - 小程序代码和云函数代码清晰分开
3. **易于识别** - 微信开发者工具能自动识别为云开发项目
4. **便于管理** - 目录结构更清晰，便于后期维护
5. **支持多端** - 方便未来扩展到其他平台

### 对比扁平结构：
```
❌ 扁平结构（旧）
- 所有文件混在一起
- 不易区分小程序代码和云函数
- 需要额外配置才能识别

✅ 子目录结构（新）
- 目录结构清晰
- 自动识别云开发
- 符合官方规范
```

---

## ⚠️ 注意事项

### 路径引用
- 小程序内部引用保持不变（如 `../../utils/util.js`）
- 不需要修改任何页面代码中的路径
- 所有相对路径都是相对于 `miniprogram/` 目录

### 云函数调用
- 云函数调用名称不变：`wx.cloud.callFunction({ name: 'getOpenid' })`
- 云函数自动从 `cloudfunctions/` 目录加载

### 版本控制
- `node_modules/` 已在 `.gitignore` 中
- 提交代码时不包含依赖包
- 其他人克隆后需要运行 `npm install`

---

## 🎯 下一步

### 上传云函数后测试：
1. 编译运行小程序
2. 查看首页是否显示 OpenID
3. 查看控制台日志确认获取成功
4. 在云开发控制台查看云函数状态

### 如果还有问题：
1. 重启微信开发者工具
2. 清除缓存：工具 → 清除缓存 → 全部清除
3. 重新导入项目
4. 检查 `.cloudbaserc.json` 和 `project.config.json` 配置

---

**环境信息**
- 环境 ID: `cloud1-0gu9re7s846e6224`
- AppID: `wx7bc4f76d2be44c22`
- 结构类型：官方推荐子目录结构
- 改造时间：2026-03-09
