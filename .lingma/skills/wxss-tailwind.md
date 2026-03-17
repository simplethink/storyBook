---
name: wxss-tailwind
version: 1.0.0
description: Tailwind CSS 风格的 WXSS 编写辅助
author: Assistant
tags: [wxss, tailwind, css, style, converter]
---

# WXSS Tailwind 样式转换助手

## 功能描述
将 Tailwind CSS 类名快速转换为微信小程序 WXSS 样式代码，支持响应式设计和性能优化。

## 使用方式

### 命令格式
```
将以下 Tailwind CSS 类名转换为 WXSS：{{classNames}}
```

### 示例
- "把 'flex items-center justify-center p-4' 转成 WXSS"
- "转换这些类名：w-full h-screen bg-white rounded-lg shadow"
- "帮我生成 WXSS：text-xl text-bold text-primary"

## 转换规则

### 布局类 (Layout)
| Tailwind | WXSS |
|---------|------|
| `flex` | `display: flex;` |
| `flex-col` | `flex-direction: column;` |
| `items-center` | `align-items: center;` |
| `justify-center` | `justify-content: center;` |
| `justify-between` | `justify-content: space-between;` |

### 间距类 (Spacing)
| Tailwind | WXSS |
|---------|------|
| `p-0` | `padding: 0;` |
| `p-1` | `padding: 8rpx;` |
| `p-2` | `padding: 16rpx;` |
| `p-3` | `padding: 24rpx;` |
| `p-4` | `padding: 32rpx;` |
| `m-2` | `margin: 16rpx;` |
| `mx-auto` | `margin-left: auto; margin-right: auto;` |

### 字体类 (Typography)
| Tailwind | WXSS |
|---------|------|
| `text-xs` | `font-size: 20rpx;` |
| `text-sm` | `font-size: 24rpx;` |
| `text-base` | `font-size: 28rpx;` |
| `text-lg` | `font-size: 32rpx;` |
| `text-xl` | `font-size: 36rpx;` |
| `text-2xl` | `font-size: 40rpx;` |
| `text-center` | `text-align: center;` |
| `text-bold` | `font-weight: bold;` |

### 颜色类 (Colors)
| Tailwind | WXSS |
|---------|------|
| `text-primary` | `color: #667eea;` |
| `text-secondary` | `color: #764ba2;` |
| `bg-white` | `background: #ffffff;` |
| `bg-gray` | `background: #f5f5f5;` |
| `bg-primary` | `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);` |

### 尺寸类 (Sizing)
| Tailwind | WXSS |
|---------|------|
| `w-full` | `width: 100%;` |
| `h-full` | `height: 100%;` |
| `w-screen` | `width: 100vw;` |
| `h-screen` | `height: 100vh;` |

### 边框与圆角 (Border & Radius)
| Tailwind | WXSS |
|---------|------|
| `rounded` | `border-radius: 8rpx;` |
| `rounded-lg` | `border-radius: 16rpx;` |
| `rounded-xl` | `border-radius: 24rpx;` |
| `rounded-full` | `border-radius: 9999rpx;` |

### 效果类 (Effects)
| Tailwind | WXSS |
|---------|------|
| `shadow` | `box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);` |
| `shadow-lg` | `box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.15);` |

## 输出格式

当用户请求转换时，请提供：

1. **完整的 WXSS 代码**
2. **对应的 WXML class 使用示例**
3. **可选的扩展说明**

### 示例输出

输入："把 'flex items-center p-4 bg-white rounded-lg' 转成 WXSS"

输出：

```css
/* 生成的 WXSS 样式 */
.flex-items-center-p4-bg-white-rounded-lg {
  display: flex;
  align-items: center;
  padding: 32rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
}
```

WXML 使用：
```xml
<view class="flex-items-center-p4-bg-white-rounded-lg">
  <!-- 内容 -->
</view>
```

## 转换注意事项

1. **单位转换**：
   - 1rem = 32rpx
   - 所有像素值自动转换为 rpx 单位
   
2. **命名建议**：
   - 可以使用组合类名（如示例）
   - 也可以拆分为多个单独的类

3. **性能优化**：
   - 避免过深的嵌套
   - 合理使用复合选择器
   - 减少重复样式

4. **兼容性**：
   - 确保所有属性在微信小程序中受支持
   - 对于不支持的属性提供替代方案

## 自定义扩展

如果用户需要自定义颜色或值，可以这样处理：

```
自定义主题色：
- primary: #667eea
- secondary: #764ba2
- accent: #f093fb
```

## 相关资源

- [微信小程序 WXSS 文档](https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxss.html)
- [Tailwind CSS 官方文档](https://tailwindcss.com/)
