# 微信云函数配置指南

## ✅ 已完成的配置

### 1. 环境 ID 配置
- **环境 ID**: `cloud1-0gu9re7s846e6224`
- 已在 `app.js` 中配置
- 已在 `.cloudbaserc.json` 中配置

### 2. 项目配置
- ✅ `project.config.json` - 已添加 `cloudFunctionRoot` 和手动打包配置
- ✅ 云函数依赖已安装（node_modules）

### 3. 云函数文件
- ✅ `cloudfunctions/getOpenid/index.js` - 云函数代码
- ✅ `cloudfunctions/getOpenid/config.json` - 权限配置
- ✅ `cloudfunctions/getOpenid/package.json` - 依赖配置
- ✅ `cloudfunctions/getOpenid/.cloudbaserc.json` - 环境配置
- ✅ `cloudfunctions/getOpenid/node_modules/` - 依赖已安装

---

## 🚀 上传云函数的步骤

### 方法一：使用工具栏（推荐）

1. **打开微信开发者工具**
2. **点击顶部菜单栏的「工具」**
3. **选择「构建 npm」**
4. **等待构建完成**
5. **在左侧文件树找到 `cloudfunctions/getOpenid`**
6. **右键点击文件夹**
7. **选择「上传并部署：云端安装依赖」**
8. **等待上传完成**

### 方法二：使用云开发控制台

1. **打开微信开发者工具**
2. **点击顶部工具栏的「云开发」按钮**
3. **进入云开发控制台**
4. **点击左侧「云函数」**
5. **点击「导入云函数」**
6. **选择 `cloudfunctions/getOpenid` 目录**
7. **点击「确定」开始上传**

### 方法三：命令行上传（高级）

如果以上方法都不行，可以使用微信开发者工具的命令行工具：

```bash
# 在微信开发者工具中打开终端
# 确保当前路径在项目根目录
```

---

## 📝 验证云函数是否上传成功

### 1. 在云开发控制台查看
- 打开云开发控制台
- 点击「云函数」
- 应该能看到 `getOpenid` 函数
- 状态显示为「部署成功」

### 2. 在小程序中测试
- 编译运行小程序
- 查看首页是否显示 OpenID
- 查看控制台日志：
  - 「从缓存获取 openid」或
  - 「云函数获取 openid 成功」

---

## 🔧 常见问题解决

### 问题 1：右键菜单没有「上传并部署」选项
**解决方案**：
1. 确认已安装 node_modules（已完成✅）
2. 确认 `project.config.json` 中 `packNpmManually: true`（已配置✅）
3. 尝试先「构建 npm」再右键上传

### 问题 2：上传失败
**解决方案**：
1. 检查网络连接
2. 重新登录微信开发者工具
3. 检查环境 ID 是否正确
4. 在云开发控制台手动删除后重新上传

### 问题 3：云函数调用失败
**解决方案**：
1. 检查是否开通云开发
2. 检查环境 ID 是否正确
3. 在云开发控制台查看云函数日志
4. 确认云函数已部署成功

---

## 💡 使用说明

### 获取 OpenID 的方式

#### 1. 全局访问（在任何页面）
```javascript
const app = getApp()
console.log('用户 OpenID:', app.globalData.openid)
```

#### 2. 异步获取（确保一定能拿到）
```javascript
app.getOpenid().then(openid => {
  console.log('用户 OpenID:', openid)
})
```

#### 3. 缓存机制
- ✅ 首次获取后会自动缓存到本地
- ✅ 下次启动优先使用缓存
- ✅ 节省云函数调用次数

---

## 📊 云函数说明

### getOpenid 函数
**功能**：获取用户 openid、appid、unionid

**返回值**：
```javascript
{
  openid: "用户 openid",
  appid: "小程序 appid", 
  unionid: "用户 unionid（如有）"
}
```

**调用方式**：
```javascript
wx.cloud.callFunction({
  name: 'getOpenid',
  data: {}
}).then(res => {
  console.log('openid:', res.result.openid)
})
```

---

## ⚠️ 注意事项

1. **必须使用真机调试或预览**  
   云函数在模拟器中可能无法正常工作

2. **每次修改云函数代码后都需要重新上传**  
   右键 → 上传并部署：云端安装依赖

3. **免费版额度限制**  
   每天有一定免费调用额度，正常使用足够

4. **生产环境建议**  
   - 添加错误处理
   - 添加重试机制
   - 监控云函数调用情况

---

## 🎯 下一步建议

获取到 openid 后，你可以：
- 将读书记录与 openid 关联，实现多用户数据隔离
- 结合云数据库存储用户数据
- 实现用户登录和个性化功能
- 添加用户信息管理

---

**环境信息**
- 环境 ID: `cloud1-0gu9re7s846e6224`
- AppID: `wx7bc4f76d2be44c22`
- 创建时间：2026-03-09
