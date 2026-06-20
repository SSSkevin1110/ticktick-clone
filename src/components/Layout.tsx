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
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';
import { useTaskStore } from '../stores/taskStore';
import { useListStore } from '../stores/listStore';
import { useThemeStore } from '../stores/themeStore';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

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

  const toggleSearch = useCallback(() => setSearchOpen((v) => !v), []);
  const toggleHelp = useCallback(() => setShortcutsOpen((v) => !v), []);

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
    <div className={`flex h-screen transition-colors ${
      resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* 侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
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
    </div>
  );
}
