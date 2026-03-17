# Lingma Skills 使用指南

## 📚 什么是 Skills？

Skills 是基于 Markdown 的提示词模板系统，用于指导 AI 助手完成特定任务。每个 Skill 都是一个独立的 `.md` 文件，包含了：

- **功能描述** - 这个 Skill 是做什么的
- **使用方式** - 如何触发和使用
- **输出规范** - AI 应该如何响应
- **最佳实践** - 相关领域的专业建议

## 📁 目录结构

```
.lingma/skills/
├── README.md                    # 本文件
├── miniprogram-component.md     # 小程序页面生成器
├── wxss-tailwind.md             # WXSS 样式转换
├── cloud-function-deploy.md     # 云函数部署
├── isbn-scanner-helper.md       # ISBN 查询助手
└── data-sync-helper.md          # 数据同步助手
```

## 🎯 如何使用 Skills

### 方式一：直接使用命令

告诉 AI 助手你要使用哪个 Skill：

```
使用 miniprogram-component skill，创建一个 bookDetail 页面
```

### 方式二：描述需求

直接描述你的需求，AI 会自动应用相应的 Skill：

```
帮我创建一个图书详情页面
```

### 方式三：带参数使用

指定具体的参数值：

```
用 isbn-scanner-helper 查询这本书：ISBN 9787550293427，优先用豆瓣 API
```

## 📋 可用 Skills 列表

### 1. Miniprogram Component (小程序页面生成器)

**用途**：快速创建微信小程序页面  
**触发词**：`生成页面`、`创建页面`、`添加页面`  
**变量**：`{{pageName}}`

**示例：**
```bash
# 生成一个图书详情页
lingma: 生成一个小程序页面：bookDetail

# 创建一个复习列表页
lingma: 创建一个新的页面：reviewList
```

**输出文件：**
- `bookDetail.wxml` - 页面结构
- `bookDetail.wxss` - 页面样式
- `bookDetail.js` - 页面逻辑
- `bookDetail.json` - 页面配置

---

### 2. WXSS Tailwind (样式转换助手)

**用途**：将 Tailwind CSS 类名转换为 WXSS 样式  
**触发词**：`转换样式`、`转成 WXSS`、`生成样式`  
**变量**：`{{classNames}}`

**示例：**
```bash
# 转换组合类名
lingma: 把 'flex items-center p-4 bg-white rounded-lg' 转成 WXSS

# 转换单个类名
lingma: text-xl text-bold text-primary 对应的 WXSS 是什么
```

**支持的类别：**
- Layout (布局)
- Spacing (间距)
- Typography (字体)
- Colors (颜色)
- Sizing (尺寸)
- Border & Radius (边框圆角)
- Effects (效果)

---

### 3. Cloud Function Deploy (云函数部署)

**用途**：部署微信云函数到云开发环境  
**触发词**：`部署函数`、`上传云函数`、`deploy`  
**变量**：`{{functionName}}`

**示例：**
```bash
# 部署单个函数
lingma: 部署 getOpenid 这个云函数

# 部署所有函数
lingma: 上传并部署所有云函数

# 检查状态
lingma: 查看 getOpenid 的部署状态
```

**部署流程：**
1. ✅ 检查目录结构
2. 📦 安装依赖
3. ☁️ 上传到云端
4. ✔️ 验证状态
5. 🧪 测试函数

---

### 4. ISBN Scanner Helper (ISBN 查询助手)

**用途**：通过 ISBN 查询图书信息  
**触发词**：`查询 ISBN`、`扫描图书`、`获取图书信息`  
**变量**：`{{isbn}}`, `{{preferProvider}}`

**示例：**
```bash
# 查询图书
lingma: 查询这本书的 ISBN: 9787550293427

# 指定数据源
lingma: 用豆瓣 API 查询 ISBN 9787550293427

# 验证 ISBN
lingma: 验证这个 ISBN 是否正确：9787550293427
```

**支持的数据源：**
- ⭐ 豆瓣 API（推荐，中文书最全）
- 🌐 Google Books（免费，外文书多）
- 📚 Open Library（开源，备选）

---

### 5. Data Sync Helper (数据同步助手)

**用途**：管理本地和云端数据同步  
**触发词**：`保存数据`、`同步`、`备份`、`导出`  
**变量**：`{{action}}`, `{{collections}}`

**示例：**
```bash
# 保存数据
lingma: 保存读书记录到本地

# 同步到云端
lingma: 把所有数据同步到云端

# 导出备份
lingma: 导出我的阅读数据做备份

# 从云端加载
lingma: 从云端下载最新的记录
```

**支持的操作：**
- 💾 Save - 保存到本地
- 📥 Load - 从本地加载
- ☁️ Sync - 同步到云端
- 📤 LoadFromCloud - 从云端加载
- 💿 Export - 导出数据
- 📥 Import - 导入数据

---

## 🔧 自定义 Skills

你可以创建自己的 Skills，只需在 `.lingma/skills/` 目录下添加新的 `.md` 文件：

### 模板结构

```markdown
---
name: your-skill-name
version: 1.0.0
description: 简短描述
author: Your Name
tags: [tag1, tag2, tag3]
---

# Skill 标题

## 功能描述
说明这个 Skill 是做什么的

## 使用方式
### 命令格式
```
命令模板：{{variableName}}
```

### 示例
- "示例命令 1"
- "示例命令 2"

## 输出要求
详细描述 AI 应该如何响应

## 注意事项
使用时需要注意的事项

## 相关资源
相关的文档链接或参考资料
```

## 💡 最佳实践

### 1. 命名规范
- 使用小写字母和连字符（kebab-case）
- 名称要清晰易懂
- 加上版本号和作者信息

### 2. 变量定义
- 使用 `{{variableName}}` 格式
- 在文档中说明每个变量的含义
- 提供默认值（如果有）

### 3. 示例丰富
- 提供多个使用示例
- 覆盖常见的使用场景
- 包含输入和输出示例

### 4. 更新维护
- 定期检查和更新 Skills
- 根据实际使用情况优化
- 保持与项目同步

## 🎨 高级用法

### 链式调用

可以组合使用多个 Skills：

```bash
# 先创建页面，再转换样式
lingma: 
1. 创建一个 bookList 页面
2. 把 'grid grid-cols-2 gap-4 p-4' 转成 WXSS
```

### 条件执行

根据情况选择不同的 Skills：

```bash
# 如果是新书就查询 ISBN，否则直接保存
if (isNewBook) {
  lingma: 查询 ISBN: {{isbn}}
} else {
  lingma: 保存数据：readingRecords
}
```

### 批量操作

一次性处理多个任务：

```bash
# 批量查询多个 ISBN
lingma: 
查询以下 ISBN:
- 9787550293427
- 9787544253994
- 9787532746989
```

## ❓ 常见问题

### Q: Skills 和普通对话有什么区别？

**A:** Skills 是预定义的提示词模板，能保证输出的一致性和质量。普通对话更灵活但结果可能不稳定。

### Q: 如何禁用某个 Skill？

**A:** 删除或重命名对应的 `.md` 文件即可。

### Q: 可以修改已有的 Skills 吗？

**A:** 当然可以！Skills 就是为你服务的，根据你的需求调整吧。

### Q: Skills 会实时更新吗？

**A:** 会的，每次调用都会读取最新的 `.md` 文件内容。

## 📖 相关资源

- [Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Markdown 语法教程](https://markdown.com.cn/)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)

---

**最后更新**: 2026-03-09  
**维护者**: StoryBook Team
