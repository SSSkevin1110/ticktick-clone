<div align="center">

# 📋 TickFlow

**一款现代化的滴答清单复刻 · 全功能任务管理应用**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Connected-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

<br/>

[![GitHub Stars](https://img.shields.io/github/stars/SSSkevin1110/ticktick-clone?style=social)](https://github.com/SSSkevin1110/ticktick-clone/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/SSSkevin1110/ticktick-clone?style=social)](https://github.com/SSSkevin1110/ticktick-clone/network/members)

</div>

---

## ✨ 项目简介

TickFlow 是一款从零开始构建的滴答清单(TickTick)网页版复刻项目，旨在完整还原滴答清单的核心功能与交互体验。采用现代前端技术栈，支持 PWA 安装到桌面使用。

> 🎯 **目标**：不仅是功能复刻，更是全栈开发能力的系统性实践。

## 🚀 核心功能

<table>
<tr>
<td width="50%">

### 📝 任务管理
- 任务创建、编辑、删除
- 优先级设置（高/中/低/无）
- 日期与时间选择
- 子任务支持
- 重复任务规则
- 自然语言智能输入
- 拖拽排序

</td>
<td width="50%">

### 📁 清单系统
- 清单创建与管理
- 文件夹分组
- 颜色与图标自定义
- 列表/看板/时间线视图
- 清单共享与协作
- 智能过滤器

</td>
</tr>
<tr>
<td width="50%">

### 📅 日历视图
- 日/周/月/议程视图
- 拖拽调整任务时间
- 多日/多周视图
- 日历订阅集成
- 可视化日程规划

</td>
<td width="50%">

### 🍅 番茄钟
- 25分钟专注计时
- 自定义时长设置
- 白噪音背景音
- 专注统计报表
- 任务关联追踪

</td>
</tr>
<tr>
<td width="50%">

### ✅ 习惯追踪
- 习惯创建与打卡
- 自定义频率设置
- 连续天数统计
- 完成率可视化
- 历史记录查看

</td>
<td width="50%">

### ⏰ 更多功能
- 倒计时/纪念日
- 艾森豪威尔矩阵
- 全文搜索
- 键盘快捷键
- 暗色模式主题
- PWA 桌面安装

</td>
</tr>
</table>

## 🛠️ 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **框架** | React 19 + TypeScript | 类型安全的现代 UI 框架 |
| **路由** | React Router v7 | 声明式客户端路由 |
| **样式** | Tailwind CSS v4 | 原子化 CSS 框架 |
| **构建** | Vite 8 | 极速开发与构建工具 |
| **后端** | Supabase | PostgreSQL + Auth + Realtime + Storage |
| **PWA** | Workbox | Service Worker 与离线缓存策略 |
| **状态** | Zustand | 轻量级状态管理 |

## 📦 快速开始

### 环境要求

- Node.js >= 18
- npm / pnpm / yarn

### 安装与运行

```bash
# 克隆仓库
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
3. 在 `.env` 中填入：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxx
```

4. 在 Supabase SQL Editor 中执行 `supabase-schema.sql` 创建数据库

## 📁 项目结构

```
ticktick-clone/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 可复用 UI 组件
│   │   ├── Layout.tsx      # 主布局
│   │   ├── Sidebar.tsx     # 侧边栏导航
│   │   ├── TaskList.tsx    # 任务列表
│   │   └── AddTask.tsx     # 任务添加
│   ├── pages/              # 页面组件
│   │   ├── AllTasks.tsx    # 全部任务
│   │   ├── Today.tsx       # 今天视图
│   │   ├── Week.tsx        # 最近7天
│   │   ├── Calendar.tsx    # 日历视图
│   │   └── ListDetail.tsx  # 清单详情
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/                # 工具库
│   │   └── supabase.ts     # Supabase 客户端
│   ├── stores/             # Zustand 状态管理
│   ├── types/              # TypeScript 类型定义
│   └── App.tsx             # 应用入口
├── supabase-schema.sql     # 数据库 Schema
├── .env.example            # 环境变量示例
└── package.json
```

## 🗺️ 开发路线

- [x] Phase 0 — 项目搭建与基础架构
- [ ] Phase 1 — Supabase 集成与认证系统
- [ ] Phase 2 — 任务管理核心功能
- [ ] Phase 3 — 日历视图与拖拽
- [ ] Phase 4 — 番茄钟与习惯追踪
- [ ] Phase 5 — 协作与高级功能
- [ ] Phase 6 — PWA 与跨平台适配
- [ ] Phase 7 — 性能优化与测试

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

---

<div align="center">

**用 ❤️ 构建 by [Leaf](https://github.com/SSSkevin1110)**

⭐ 觉得不错？给个 Star 支持一下吧！

</div>
