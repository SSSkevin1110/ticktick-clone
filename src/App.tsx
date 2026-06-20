import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import AllTasks from './pages/AllTasks';
import Today from './pages/Today';
import Week from './pages/Week';
import Calendar from './pages/Calendar';
import ListDetail from './pages/ListDetail';
import Pomodoro from './pages/Pomodoro';
import Statistics from './pages/Statistics';
import Habits from './pages/Habits';
import Countdown from './pages/Countdown';
import Matrix from './pages/Matrix';
import Settings from './pages/Settings';
import { useAuthStore } from './stores/authStore';

/**
 * 受保护的路由包装器
 * 未登录时重定向到登录页
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  // 在此处初始化认证状态（而不是在 Layout 中）
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 加载中显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">正在连接...</p>
        </div>
      </div>
    );
  }

  // 未登录重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

/**
 * 应用根组件
 * 配置路由，处理认证状态
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* 登录/注册页 - 未登录可访问 */}
        <Route path="/auth" element={<Auth />} />

        {/* 主应用 - 需要登录 */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AllTasks />} />
          <Route path="today" element={<Today />} />
          <Route path="week" element={<Week />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="pomodoro" element={<Pomodoro />} />
          <Route path="list/:listId" element={<ListDetail />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="habits" element={<Habits />} />
          <Route path="countdown" element={<Countdown />} />
          <Route path="matrix" element={<Matrix />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* 未匹配路由重定向到首页 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
