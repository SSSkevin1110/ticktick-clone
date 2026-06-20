<div align="center">

# 📋 TickFlow

**一个从零构建的滴答清单复刻 · 支持 PWA 安装到桌面**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)

</div>

---

## ✨ 这是什么？

TickFlow 是一个**高仿滴答清单**的全功能任务管理 Web 应用。

灵感来源于日常使用滴答清单的体验，想通过这个项目练习全栈开发能力，从 UI 到后端、从状态管理到实时同步，完整走一遍。

> 🎯 **亮点**：支持 PWA 安装到手机/电脑桌面，像原生应用一样使用。

## 🖼️ 预览

| 亮色模式 | 暗色模式 |
|:---:|:---:|
| *日历视图 · 任务管理* | *深色主题 · 番茄钟* |

## 🚀 核心功能

| 模块 | 功能 | 模块 | 功能 |
|:---|:---|:---|:---|
| 📝 任务管理 | 创建/编辑/删除、子任务、重复任务 | 📁 清单系统 | 文件夹分组、列表/看板/时间线视图 |
| 📅 日历视图 | 月/周/日/议程四种视图 | 🔍 搜索过滤 | 全文搜索、自定义过滤器 |
| 🍅 番茄钟 | 25+5 专注计时、任务关联 | ✅ 习惯追踪 | 每日打卡、连续天数热力图 |
| 📊 统计报表 | 完成趋势图、优先级分布 | ⏰ 倒计时 | 纪念日、置顶、进度条 |
| 📐 四象限 | 艾森豪威尔矩阵视图 | 🌙 暗色模式 | 亮色/暗色/跟随系统 |
| ⌨️ 快捷键 | `N` 添加 / `/` 搜索 / `?` 帮助 | 📱 PWA | 安装到桌面、离线缓存 |

## 🛠️ 技术栈

- **前端**：React 19 + TypeScript + Tailwind CSS
- **后端**：Supabase（数据库 + 认证 + 实时同步）
- **状态管理**：Zustand
- **图表**：Recharts
- **构建**：Vite
- **PWA**：vite-plugin-pwa

## 📦 快速开始

```bash
# 克隆
git clone https://github.com/SSSkevin1110/ticktick-clone.git
cd ticktick-clone

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入你的 Supabase 配置

# 启动开发服务器
npm run dev
```

### Supabase 配置

1. 前往 [supabase.com](https://supabase.com) 创建项目
2. 获取 **Project URL** 和 **Publishable Key**
3. 填入 `.env` 文件
4. 在 SQL Editor 中执行 `supabase-schema.sql`

## 📁 项目结构

```
src/
├── components/          # UI 组件
│   ├── calendar/        # 日历视图
│   ├── pomodoro/        # 番茄钟
│   ├── habits/          # 习惯追踪
│   └── stats/           # 统计图表
├── pages/               # 页面
├── stores/              # Zustand 状态管理
├── lib/                 # 工具库
└── types/               # 类型定义
```

## 📱 PWA 安装

1. 运行 `npm run build && npm run preview`
2. 打开 http://localhost:4173
3. 点击浏览器地址栏的「安装」按钮
4. 或者在手机浏览器中「添加到主屏幕」

## 🤝 贡献

欢迎提 Issue 和 PR！

```bash
git checkout -b feature/your-feature
git commit -m "feat: add something"
git push origin feature/your-feature
```

## 📄 License

[MIT](LICENSE)

---

<div align="center">

**Built with ❤️ by [Leaf](https://github.com/SSSkevin1110)**

⭐ 如果对你有帮助，点个 Star 支持一下！

</div>
