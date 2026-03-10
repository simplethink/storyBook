# 微信开发者工具 npm 构建问题解决方案

## 问题描述

微信开发者工具在构建 npm 时报错，主要原因是：
1. `@babel/runtime` 等包在小程序端需要正确构建
2. 云函数依赖中的某些包（如 `undici-types`、`ts-node` 等）与微信 IDE 的构建工具不兼容

## 已完成的配置

### 1. 小程序端依赖
✅ 已在 `miniprogram/` 目录下安装 `@babel/runtime`
✅ 已创建 `miniprogram/package.json`

### 2. 云函数端依赖
✅ 已在所有云函数目录安装生产环境依赖
✅ 已更新 `project.config.json` 禁用自动 npm 构建

### 3. 项目配置
✅ `packNpmManually: false` - 禁用手动打包
✅ `packNpmRelationList: []` - 清空关联列表

## 使用方法

### 方式一：使用微信开发者工具（推荐）

#### 小程序端
1. **点击菜单**：工具 → 构建 npm
2. **选择范围**：仅构建小程序（miniprogram）
3. **等待完成**：应该只会构建 `@babel/runtime`
4. **重新编译**：点击编译按钮

#### 云函数端（上传并部署）
由于云函数的某些依赖包与 IDE 构建工具不兼容，**建议使用以下方式之一**：

**方法 A：右键上传（推荐）**
1. 在微信开发者工具中，展开 `cloudfunctions` 目录
2. 右键点击 `getUserInfo` 文件夹
3. 选择 **【上传并部署：云端安装依赖】**
4. 对其余云函数重复此操作：
   - `quickstartFunctions`
   - `syncReadingRecords`
   - `syncReviewTasks`

**方法 B：使用命令行上传**
```bash
# 上传 getUserInfo
wx cloud functions deploy --e cloud1-0gu9re7s846e6224 --n getUserInfo --r --project /Users/qihao/WeChatProjects/miniprogram-1

# 上传 quickstartFunctions
wx cloud functions deploy --e cloud1-0gu9re7s846e6224 --n quickstartFunctions --r --project /Users/qihao/WeChatProjects/miniprogram-1

# 上传 syncReadingRecords
wx cloud functions deploy --e cloud1-0gu9re7s846e6224 --n syncReadingRecords --r --project /Users/qihao/WeChatProjects/miniprogram-1

# 上传 syncReviewTasks
wx cloud functions deploy --e cloud1-0gu9re7s846e6224 --n syncReviewTasks --r --project /Users/qihao/WeChatProjects/miniprogram-1
```

### 方式二：使用自动化脚本

运行提供的 shell 脚本：
```bash
./uploadCloudFunction.sh cloud1-0gu9re7s846e6224
```

然后按照提示在微信开发者工具中右键上传各个云函数。

## 注意事项

1. **不要点击"工具 → 构建 npm"来构建云函数**
   - 这会导致类型定义包和开发依赖包的构建错误
   
2. **云函数必须使用"上传并部署：云端安装依赖"**
   - 这样微信会在云端自动安装依赖，避免本地构建问题
   
3. **小程序端只需要构建一次**
   - 只有 `@babel/runtime` 需要在小程序端构建
   - 构建后如果还有问题，尝试清缓存后重新构建

4. **如果遇到其他问题**
   - 清缓存：清缓存 → 清除全部缓存
   - 重启微信开发者工具
   - 检查 `project.config.json` 配置是否正确

## 常见问题

### Q: 为什么云函数不能通过 IDE 自动构建？
A: 因为 `wx-server-sdk` 的一些间接依赖包（如 `undici-types`、`ts-node`、`dunder-proto` 等）是 TypeScript 类型定义或开发工具包，它们的入口文件配置与微信小程序的构建工具不兼容。

### Q: "云端安装依赖"是什么意思？
A: 这是微信云开发提供的一种部署方式。当你右键选择"上传并部署：云端安装依赖"时，微信会：
1. 将你的云函数代码上传到云端
2. 在云端自动执行 `npm install` 安装依赖
3. 自动部署并启用云函数

这样可以避免本地构建的兼容性问题。

### Q: 小程序端的 @babel/runtime 为什么需要构建？
A: 因为现代 JavaScript 语法（如 class、箭头函数等）需要通过 Babel 转换为小程序支持的语法。`@babel/runtime` 提供了转换所需的 helper 函数。

## 技术细节

### package.json 配置说明

**小程序端 (miniprogram/package.json)**
```json
{
  "dependencies": {
    "@babel/runtime": "^7.28.6"
  }
}
```

**云函数端 (cloudfunctions/*/package.json)**
```json
{
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

### project.config.json 关键配置

```json
{
  "setting": {
    "packNpmManually": false,
    "packNpmRelationList": [],
    "nodeModules": false
  }
}
```

这些配置确保：
- 不自动进行 npm 打包
- 不使用复杂的 npm 关联关系
- 让小程序和云函数各自独立管理依赖

---

**最后更新**: 2026-03-09  
**环境**: macOS, 微信开发者工具 2.01.2510260
