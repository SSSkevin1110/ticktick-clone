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

TickFlow 是一款从零开始构建的滴答清单(TickTick)网页版复刻项目，旨在**完整还原滴答清单的 20 个功能模块**与交互体验。采用 React 19 + Supabase + PWA 现代技术栈，支持安装到桌面使用。

> 🎯 **目标**：覆盖滴答清单网页版全部功能，包括任务管理、日历、番茄钟、习惯追踪、协作、统计等 20 个模块。

## 🚀 功能全景（20 个模块）

### P0 · 核心功能

<table>
<tr>
<td width="50%">

### 📝 任务管理
- 任务创建、编辑、删除
- 子任务无限嵌套
- 重复任务（每天/周/月/年/自定义）
- 多提醒支持
- 四级优先级（🔴高 🟠中 🔵低 ⚪无）
- 标签系统
- 富文本描述
- 文件附件上传
- 任务评论与协作
- 自然语言智能输入（`明天下午3点开会 #工作 !高`）
- 拖拽排序
- 软删除（回收站）

</td>
<td width="50%">

### 📁 清单系统
- 清单创建与管理
- 文件夹嵌套分组
- 颜色标记 + Emoji 图标
- 列表 / 看板 / 时间线三种视图
- 清单归档
- 清单共享（查看/编辑/管理员角色）
- 清单排序（名称/时间/自定义拖拽）

</td>
</tr>
<tr>
<td width="50%">

### 📅 日历视图
- 日 / 周 / 月 / 议程四种视图
- 多日 / 多周自定义视图
- 拖拽调整任务日期和时间
- 任务时间条可视化
- 日历订阅（iCal 导出）
- 按清单/标签/优先级过滤

</td>
<td width="50%">

### 🔍 搜索与过滤
- 全文搜索（标题、描述、标签）
- 实时搜索（debounce 300ms）
- 自定义过滤器（AND/OR 条件组合）
- 智能列表（动态聚合规则）
- 快速过滤按钮栏
- 搜索历史记录

</td>
</tr>
<tr>
<td width="50%">

### 🏠 智能视图
- **今天** — 今日到期任务
- **最近7天** — 未来一周任务
- **全部任务** — 所有未完成任务
- **已分配给我** — 协作任务
- **已完成** — 历史完成记录
- **已过期** — 逾期未完成任务

</td>
<td width="50%">

### 📐 侧边栏
- 自定义排序（拖拽重排）
- 模块折叠/展开
- 快捷方式入口
- 用户信息区
- 搜索入口（Ctrl+K）
- 快速添加按钮
- 清单右键菜单

</td>
</tr>
</table>

### P1 · 重要功能

<table>
<tr>
<td width="50%">

### 🍅 番茄钟
- 25+5 分钟专注计时
- 自定义时长设置
- 任务关联追踪
- 白噪音（雨声/海浪/森林/咖啡厅）
- 专注统计报表
- 4 个番茄后长休息 15 分钟

</td>
<td width="50%">

### ✅ 习惯追踪
- 习惯创建（名称/图标/颜色/频率）
- 每日打卡 / 取消打卡
- 自定义频率（每天/每周N天）
- 连续天数统计（Streak）
- 完成率可视化
- 日历热力图（GitHub 贡献图风格）

</td>
</tr>
<tr>
<td width="50%">

### 📊 统计报表
- 任务完成趋势图
- 效率分析（平均完成时间）
- 按清单/优先级分类统计
- 番茄钟专注统计
- 习惯完成率统计
- 数据可视化（柱状/折线/饼图）

</td>
<td width="50%">

### ⚙️ 个性化设置
- 40+ 预设主题
- 自定义主题色
- 暗色 / 亮色 / 跟随系统
- 自定义键盘快捷键
- 通知设置（浏览器/邮件/免打扰）
- 12h/24h 时间格式
- 一周起始日设置

</td>
</tr>
</table>

### P2 · 增强功能

<table>
<tr>
<td width="50%">

### 👥 协作功能
- 清单共享（邮箱/链接邀请）
- 三种角色权限控制
- 任务分配
- 评论交流（实时同步）
- Supabase Realtime 多设备同步

</td>
<td width="50%">

### ⏰ 倒计时 / 纪念日
- 目标日期倒计时
- 纪念日正计时（已过天数）
- 年重复提醒
- 置顶显示
- 多种显示样式

</td>
</tr>
<tr>
<td width="50%">

### 📐 艾森豪威尔矩阵
- 四象限视图（紧急×重要）
- 拖拽任务到象限
- 策略标签（立即做/计划做/委托做/删除）
- 自动优先级映射

</td>
<td width="50%">

### ⌨️ 键盘快捷键
- `N` 快速添加任务
- `/` 聚焦搜索
- `G+T/W/A/C` 跳转视图
- `J/K` 上下选择任务
- `Space` 完成任务
- `?` 快捷键帮助

</td>
</tr>
<tr>
<td width="50%">

### 📱 PWA 支持
- 安装到桌面（Chrome/Edge/Safari）
- 离线查看已缓存数据
- 离线创建任务，上线自动同步
- 推送通知
- 自定义图标和启动画面

</td>
<td width="50%">

### 🌍 更多特性
- **暗色模式** — 深色主题，减少视觉疲劳
- **数据导入导出** — CSV/JSON/iCal/Markdown
- **国际化** — 中文/English/繁體
- **通知系统** — 浏览器通知 + 持续提醒
- **位置提醒** — 到达/离开某地时提醒

</td>
</tr>
</table>

## 🛠️ 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **框架** | React 19 + TypeScript 6 | 类型安全的现代 UI 框架 |
| **路由** | React Router v7 | 声明式客户端路由 |
| **样式** | Tailwind CSS v4 | 原子化 CSS 框架 |
| **构建** | Vite 8 | 极速开发与构建工具 |
| **后端** | Supabase | PostgreSQL + Auth + Realtime + Storage |
| **状态** | Zustand | 轻量级状态管理 |
| **拖拽** | @dnd-kit | 现代拖拽排序库 |
| **图表** | Recharts | React 图表库 |
| **图标** | Lucide React | 精美开源图标集 |
| **PWA** | vite-plugin-pwa | Service Worker 与离线缓存 |
| **国际化** | i18next | 多语言支持 |

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
├── public/                    # 静态资源
├── src/
│   ├── components/            # 可复用 UI 组件
│   │   ├── Layout.tsx         # 主布局（响应式侧边栏）
│   │   ├── Sidebar.tsx        # 侧边栏导航
│   │   ├── TaskList.tsx       # 任务列表（支持拖拽）
│   │   ├── TaskDetail.tsx     # 任务详情面板
│   │   ├── AddTask.tsx        # 快速添加任务
│   │   ├── QuickAdd.tsx       # 全局快速添加弹窗
│   │   ├── Calendar*.tsx      # 日历组件（日/周/月/议程）
│   │   ├── Pomodoro.tsx       # 番茄钟计时器
│   │   ├── HabitTracker.tsx   # 习惯追踪
│   │   └── Modal.tsx          # 通用模态框
│   ├── pages/                 # 页面组件
│   │   ├── AllTasks.tsx       # 全部任务
│   │   ├── Today.tsx          # 今天视图
│   │   ├── Week.tsx           # 最近7天
│   │   ├── Calendar.tsx       # 日历视图
│   │   ├── Matrix.tsx         # 艾森豪威尔矩阵
│   │   ├── Statistics.tsx     # 统计报表
│   │   ├── Settings.tsx       # 设置页面
│   │   └── ListDetail.tsx     # 清单详情
│   ├── hooks/                 # 自定义 Hooks
│   ├── stores/                # Zustand 状态管理
│   ├── lib/                   # 工具库
│   │   ├── supabase.ts        # Supabase 客户端
│   │   ├── nlp.ts             # 自然语言解析
│   │   └── i18n.ts            # 国际化配置
│   ├── types/                 # TypeScript 类型定义
│   └── App.tsx                # 应用入口
├── supabase-schema.sql        # 数据库 Schema（13 张表 + RLS）
├── .env.example               # 环境变量示例
└── package.json
```

## 🗺️ 开发路线

| 阶段 | 内容 | 预计时间 |
|------|------|----------|
| ✅ Phase 0 | 项目搭建与基础架构 | 已完成 |
| 🔄 Phase 1 | Supabase 集成 + 认证系统 + Zustand 状态管理 | 3-5 天 |
| 📝 Phase 2 | 任务管理核心（详情面板/子任务/标签/自然语言/拖拽） | 5-7 天 |
| 📅 Phase 3 | 日历视图（周/日/议程/拖拽改日期）+ 智能视图 | 5-7 天 |
| 🍅 Phase 4 | 番茄钟 + 习惯追踪 + 统计图表 | 5-7 天 |
| 👥 Phase 5 | 协作功能 + 倒计时 + 矩阵 + 搜索过滤 | 5-7 天 |
| 📱 Phase 6 | PWA + 暗色模式 + 国际化 + 键盘快捷键 + 通知 | 5-7 天 |

## 📐 设计规范

| 元素 | 值 | 说明 |
|------|------|------|
| 主色调 | `#4F46E5` | Indigo 品牌色 |
| 侧边栏 | `260px` | 固定宽度，可折叠 |
| 内容区 | `max-width: 768px` | 居中显示 |
| 优先级-高 | `#EF4444` | 红色 |
| 优先级-中 | `#F59E0B` | 橙色 |
| 优先级-低 | `#3B82F6` | 蓝色 |
| 过渡动画 | `150ms ease` | 默认过渡时间 |
| 圆角 | `8px (rounded-lg)` | 卡片/按钮/导航项 |

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
