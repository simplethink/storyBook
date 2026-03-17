---
name: cloud-function-deploy
version: 1.0.0
description: 一键部署微信云函数
author: Assistant
tags: [cloud-function, wechat, deploy, cloudbase]
---

# 微信云函数部署助手

## 功能描述
帮助开发者快速部署微信小程序云函数到微信云开发环境，包括依赖安装、上传和状态检查。

## 使用方式

### 命令格式
```
部署云函数：{{functionName}}
```

### 示例
- "部署 getOpenid 这个云函数"
- "帮我上传所有云函数"
- "检查 cloudFunction 的部署状态"
- "重新部署 reviewTask 函数"

## 环境配置

### 默认配置
```yaml
环境 ID: cloud1-0gu9re7s846e6224
云函数根目录：cloudfunctions/
自动安装依赖：true
上传后验证：true
```

## 部署流程

当用户请求部署云函数时，请按照以下步骤执行：

### Step 1: 检查云函数目录结构

确认云函数目录存在且包含必要文件：
```
cloudfunctions/{{functionName}}/
├── index.js      # 主入口文件
├── package.json  # 依赖配置
└── config.json   # 云函数配置（可选）
```

**检查清单：**
- ✅ 目录是否存在
- ✅ index.js 是否存在
- ✅ package.json 是否存在
- ✅ 导出格式是否正确（必须使用 `exports.main`）

### Step 2: 安装依赖（如需要）

如果 `package.json` 中存在 dependencies，执行：

```bash
cd cloudfunctions/{{functionName}}
npm install
```

**常见依赖：**
- `wx-server-sdk` - 微信云开发 SDK（必需）
- 其他第三方 npm 包

### Step 3: 上传云函数

#### 方法一：使用微信开发者工具 CLI

```bash
# 安装 CLI（如果未安装）
npm install -g @cloudbase/cli

# 部署单个函数
cloudbase functions deploy {{functionName}} --env cloud1-0gu9re7s846e6224

# 部署所有函数
cloudbase functions:deploy --env cloud1-0gu9re7s846e6224
```

#### 方法二：使用微信开发者工具 GUI

1. 打开微信开发者工具
2. 点击「云开发」按钮
3. 进入「云函数」页面
4. 右键点击函数目录
5. 选择「上传并部署：云端安装依赖」

#### 方法三：使用 IDE 插件

如果使用 Lingma IDE，可以直接执行：
```
lingma deploy {{functionName}}
```

### Step 4: 验证部署状态

```bash
# 查看函数状态
cloudbase functions:status {{functionName}} --env cloud1-0gu9re7s846e6224

# 查看函数日志
cloudbase functions:log {{functionName}} --env cloud1-0gu9re7s846e6224
```

**验证要点：**
- ✅ 函数版本是否更新
- ✅ 运行状态是否正常
- ✅ 是否有错误日志

### Step 5: 测试函数

在小程序端或云开发控制台测试函数：

```javascript
// 小程序端调用示例
wx.cloud.callFunction({
  name: '{{functionName}}',
  data: {
    // 传递的参数
  },
  success: res => {
    console.log('调用成功:', res.result);
  },
  fail: err => {
    console.error('调用失败:', err);
  }
})
```

## 常见问题排查

### 问题 1: 依赖安装失败

**症状：**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**解决方案：**
```bash
# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 问题 2: 上传超时

**症状：**
```
Error: Upload timeout
```

**解决方案：**
- 检查网络连接
- 压缩函数体积（移除不必要的依赖）
- 分批次上传大型依赖

### 问题 3: 函数调用失败

**症状：**
```
errCode: -1 | errMsg: Function not found
```

**解决方案：**
- 确认函数名称正确
- 等待 1-2 分钟让部署生效
- 检查环境变量配置

### 问题 4: 权限错误

**症状：**
```
errCode: -502001 | errMsg: function call error, system error
```

**解决方案：**
- 检查云开发环境权限
- 确认已开通云开发服务
- 检查 AppID 是否匹配

## 最佳实践

### 1. 代码规范

```javascript
// cloudfunctions/getOpenid/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  return {
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID
  }
}
```

### 2. Package.json 配置

```json
{
  "name": "getOpenid",
  "version": "1.0.0",
  "description": "获取用户 OpenID",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

### 3. 版本管理

- 使用语义化版本号
- 在 Git 中跟踪 package.json
- 忽略 node_modules（添加到 .gitignore）

### 4. 本地测试

```javascript
// 本地调试脚本
if (process.env.NODE_ENV !== 'production') {
  exports.main({ userId: 'test123' }, {})
    .then(result => console.log(result))
    .catch(console.error)
}
```

## 批量部署

部署项目中所有云函数：

```bash
# 遍历 cloudfunctions 目录下所有子目录
for dir in cloudfunctions/*/; do
  functionName=$(basename "$dir")
  echo "Deploying $functionName..."
  cloudbase functions deploy $functionName --env cloud1-0gu9re7s846e6224
done
```

## 监控与日志

### 查看实时日志
```bash
cloudbase functions:log {{functionName}} --env cloud1-0gu9re7s846e6224 --tail
```

### 性能指标
- 平均响应时间
- 错误率统计
- 调用次数统计

## 相关资源

- [微信云开发官方文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- [CloudBase CLI 文档](https://docs.cloudbase.net/cli-v1/zh-cn/cli-reference.html)
- [云函数最佳实践](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/functions/function.html)
