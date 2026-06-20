import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/', label: '全部', icon: '📋' },
  { path: '/today', label: '今天', icon: '📅' },
  { path: '/week', label: '最近7天', icon: '📆' },
  { path: '/calendar', label: '日历', icon: '🗓️' },
];

const defaultLists = [
  { id: '1', name: '个人', color: '#4F46E5', icon: '👤' },
  { id: '2', name: '工作', color: '#10B981', icon: '💼' },
  { id: '3', name: '学习', color: '#F59E0B', icon: '📚' },
];

export default function Sidebar() {
  const location = useLocation();
  const [lists, setLists] = useState(defaultLists);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');

  const handleAddList = () => {
    if (newListName.trim()) {
      const newList = {
        id: Date.now().toString(),
        name: newListName.trim(),
        color: '#6366F1',
        icon: '📁',
      };
      setLists([...lists, newList]);
      setNewListName('');
      setIsAddingList(false);
    }
  };

  return (
    <aside className="w-[260px] h-screen bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* 用户头像 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
            U
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">用户名</div>
            <div className="text-sm text-gray-500 truncate">免费版</div>
          </div>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="p-3">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索任务..."
            className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <span className="absolute left-2.5 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* 添加任务按钮 */}
      <div className="px-3 mb-2">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium">
          <span className="text-lg">+</span>
          <span>添加任务</span>
        </button>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <div className="space-y-0.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* 清单列表 */}
        <div className="mt-6">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">清单</span>
            <button
              onClick={() => setIsAddingList(true)}
              className="text-gray-400 hover:text-gray-600"
            >
              +
            </button>
          </div>
          <div className="space-y-0.5">
            {lists.map((list) => (
              <Link
                key={list.id}
                to={`/list/${list.id}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  location.pathname === `/list/${list.id}`
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{list.icon}</span>
                <span className="flex-1 truncate">{list.name}</span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: list.color }}
                />
              </Link>
            ))}

            {/* 添加清单输入框 */}
            {isAddingList && (
              <div className="px-3 py-2">
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddList();
                    if (e.key === 'Escape') setIsAddingList(false);
                  }}
                  placeholder="清单名称"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 底部设置 */}
      <div className="p-3 border-t border-gray-200">
        <button className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <span>⚙️</span>
          <span>设置</span>
        </button>
      </div>
    </aside>
  );
}
