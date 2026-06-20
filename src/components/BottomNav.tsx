import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, Calendar, Plus, Repeat, Settings } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';

/**
 * 移动端底部导航栏
 * - 今天/日历/添加/习惯/设置 五个图标
 * - 固定在底部
 * - 只在移动端显示（lg:hidden）
 */
export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setQuickAddOpen } = useUIStore();

  const navItems = [
    { path: '/today', label: '今天', icon: CalendarDays },
    { path: '/calendar', label: '日历', icon: Calendar },
    { path: '__add__', label: '添加', icon: Plus, isAction: true },
    { path: '/habits', label: '习惯', icon: Repeat },
    { path: '/settings', label: '设置', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 lg:hidden">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = !item.isAction && location.pathname === item.path;

          // 添加按钮：居中放大
          if (item.isAction) {
            return (
              <button
                key={item.path}
                onClick={() => setQuickAddOpen(true)}
                className="flex items-center justify-center w-12 h-12 -mt-4 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 transition-colors"
              >
                <item.icon size={24} />
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
