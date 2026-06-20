import { useEffect, useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import QuickAdd from './QuickAdd';
import ToastContainer from './Toast';
import BottomNav from './BottomNav';
import TaskDetail from './TaskDetail';
import SearchModal from './SearchModal';
import ShortcutsHelp from './ShortcutsHelp';
import InstallPrompt from './InstallPrompt';
import Tutorial from './Tutorial';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';
import { useTaskStore } from '../stores/taskStore';
import { useListStore } from '../stores/listStore';
import { useThemeStore } from '../stores/themeStore';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

/** 教程显示状态的 localStorage key */
const TUTORIAL_KEY = 'tickflow_tutorial_shown';

/**
 * 应用主布局
 * - 响应式支持：移动端隐藏侧边栏，平板可折叠，桌面固定
 * - 集成 QuickAdd、Toast、BottomNav、TaskDetail
 */
export default function Layout() {
  const { setSidebarOpen } = useUIStore();
  const { user } = useAuthStore();
  const { fetchTasks } = useTaskStore();
  const { fetchLists } = useListStore();
  const { initialize: initTheme, resolvedTheme } = useThemeStore();

  // 搜索和快捷键帮助弹窗状态
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  // 新手教程状态
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const toggleSearch = useCallback(() => setSearchOpen((v) => !v), []);
  const toggleHelp = useCallback(() => setShortcutsOpen((v) => !v), []);

  // 首次访问时显示教程
  useEffect(() => {
    const hasShownTutorial = localStorage.getItem(TUTORIAL_KEY);
    if (!hasShownTutorial) {
      // 延迟显示，等页面加载完成
      const timer = setTimeout(() => setTutorialOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // 关闭教程时标记已显示
  const handleCloseTutorial = () => {
    setTutorialOpen(false);
    localStorage.setItem(TUTORIAL_KEY, 'true');
  };

  // 注册键盘快捷键
  useKeyboardShortcuts({ onToggleSearch: toggleSearch, onToggleHelp: toggleHelp });

  // 初始化主题
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  // 用户登录后加载数据
  useEffect(() => {
    if (user?.id) {
      fetchTasks(user.id);
      fetchLists(user.id);
    }
  }, [user?.id, fetchTasks, fetchLists]);

  // 响应式：小屏幕默认关闭侧边栏
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  return (
    <div
      className="flex h-screen transition-colors"
      style={{
        backgroundColor: resolvedTheme === 'dark' ? 'var(--color-bg-primary)' : 'white'
      }}
    >
      {/* 侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <main
        className="flex-1 overflow-y-auto pb-16 lg:pb-0"
        style={{
          backgroundColor: resolvedTheme === 'dark' ? 'var(--color-bg-primary)' : 'white'
        }}
      >
        <Outlet />
      </main>

      {/* 任务详情面板 */}
      <TaskDetail />

      {/* 快速添加弹窗 */}
      <QuickAdd />

      {/* Toast 通知 */}
      <ToastContainer />

      {/* 移动端底部导航 */}
      <BottomNav />

      {/* 搜索弹窗 */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* 快捷键帮助弹窗 */}
      <ShortcutsHelp isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      {/* PWA 安装提示 */}
      <InstallPrompt />

      {/* 新手教程 */}
      <Tutorial isOpen={tutorialOpen} onClose={handleCloseTutorial} />
    </div>
  );
}
