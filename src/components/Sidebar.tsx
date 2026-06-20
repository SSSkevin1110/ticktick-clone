import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Calendar,
  LayoutGrid,
  List,
  Plus,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  Palette,
  Timer,
  BarChart3,
  CheckCircle,
} from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import { useListStore } from '../stores/listStore';
import { useTagStore } from '../stores/tagStore';
import { useAuthStore } from '../stores/authStore';
import { showToast } from './Toast';
import SearchModal from './SearchModal';
import TagManager from './TagManager';

/**
 * 导航菜单项配置
 */
const menuItems = [
  { path: '/', label: '全部任务', icon: LayoutGrid },
  { path: '/today', label: '今天', icon: CalendarDays },
  { path: '/week', label: '最近7天', icon: Calendar },
];

/**
 * 智能视图菜单项
 */
const smartItems = [
  { path: '/pomodoro', label: '番茄钟', icon: Timer },
  { path: '/habits', label: '习惯', icon: CheckCircle },
  { path: '/statistics', label: '统计', icon: BarChart3 },
];

/**
 * 侧边栏组件
 * - 从 listStore 获取清单列表
 * - 从 tagStore 获取标签列表
 * - 搜索功能（打开 SearchModal）
 * - 快速添加按钮
 * - 清单右键菜单（重命名/删除/改色）
 * - 标签区域（显示标签列表，点击过滤）
 */
export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarOpen, toggleSidebar, setQuickAddOpen } = useUIStore();
  const { lists, fetchLists, createList, updateList, deleteList } = useListStore();
  const { tags, fetchTags } = useTagStore();
  const { user } = useAuthStore();

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    listId: string;
    x: number;
    y: number;
  } | null>(null);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [tagManagerOpen, setTagManagerOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const addListInputRef = useRef<HTMLInputElement>(null);

  // 初始化时获取清单列表和标签
  useEffect(() => {
    if (user?.id) {
      fetchLists(user.id);
      fetchTags(user.id);
    }
  }, [user?.id, fetchLists, fetchTags]);

  // 聚焦添加清单输入框
  useEffect(() => {
    if (isAddingList) {
      setTimeout(() => addListInputRef.current?.focus(), 50);
    }
  }, [isAddingList]);

  // 点击外部关闭右键菜单
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    if (contextMenu) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [contextMenu]);

  // 添加清单
  const handleAddList = async () => {
    if (newListName.trim() && user?.id) {
      await createList(
        {
          name: newListName.trim(),
          color: '#6366F1',
          sortOrder: lists.length,
        },
        user.id
      );
      setNewListName('');
      setIsAddingList(false);
      showToast('清单已创建', 'success');
    }
  };

  // 清单右键菜单
  const handleContextMenu = (e: React.MouseEvent, listId: string) => {
    e.preventDefault();
    setContextMenu({ listId, x: e.clientX, y: e.clientY });
  };

  // 重命名清单
  const handleRename = async (listId: string) => {
    if (editingName.trim()) {
      await updateList(listId, { name: editingName.trim() });
      showToast('清单已重命名', 'success');
    }
    setEditingListId(null);
    setContextMenu(null);
  };

  // 删除清单
  const handleDelete = async (listId: string) => {
    await deleteList(listId);
    setContextMenu(null);
    showToast('清单已删除', 'info');
    // 如果当前在该清单页面，跳转到今天
    if (location.pathname === `/list/${listId}`) {
      navigate('/today');
    }
  };

  // 点击标签过滤
  const handleTagClick = (tagName: string) => {
    if (selectedTag === tagName) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tagName);
    }
  };

  return (
    <>
      {/* 侧边栏 */}
      <aside
        className={`h-screen bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-150 ${
          sidebarOpen ? 'w-[260px]' : 'w-0'
        } overflow-hidden flex-shrink-0
          max-lg:fixed max-lg:z-30 max-lg:shadow-xl
        `}
      >
        <div className="w-[260px] h-full flex flex-col">
          {/* 用户头像 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {user?.displayName || '未登录'}
                </div>
                <div className="text-sm text-gray-500 truncate">免费版</div>
              </div>
            </div>
          </div>

          {/* 搜索框 */}
          <div className="p-3">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-400 hover:border-gray-300 transition-colors"
            >
              <Search size={14} />
              <span>搜索任务...</span>
            </button>
          </div>

          {/* 添加任务按钮 */}
          <div className="px-3 mb-2">
            <button
              onClick={() => setQuickAddOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium text-sm"
            >
              <Plus size={16} />
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
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* 智能视图 */}
            <div className="mt-4">
              <div className="px-3 mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  智能视图
                </span>
              </div>
              <div className="space-y-0.5">
                {smartItems.map((item) => {
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
                      <item.icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 清单列表 */}
            <div className="mt-6">
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  清单
                </span>
                <button
                  onClick={() => setIsAddingList(true)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="space-y-0.5">
                {lists.map((list) => (
                  <div key={list.id} className="relative">
                    {editingListId === list.id ? (
                      /* 编辑模式 */
                      <div className="px-3 py-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(list.id);
                            if (e.key === 'Escape') setEditingListId(null);
                          }}
                          onBlur={() => handleRename(list.id)}
                          className="w-full px-2 py-1 text-sm border border-indigo-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          autoFocus
                        />
                      </div>
                    ) : (
                      /* 正常模式 */
                      <Link
                        to={`/list/${list.id}`}
                        onContextMenu={(e) => handleContextMenu(e, list.id)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          location.pathname === `/list/${list.id}`
                            ? 'bg-indigo-50 text-indigo-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <List size={16} />
                        <span className="flex-1 truncate">{list.name}</span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleContextMenu(e, list.id);
                          }}
                          className="p-0.5 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal size={14} />
                        </button>
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: list.color }}
                        />
                      </Link>
                    )}
                  </div>
                ))}

                {/* 添加清单输入框 */}
                {isAddingList && (
                  <div className="px-3 py-2">
                    <input
                      ref={addListInputRef}
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddList();
                        if (e.key === 'Escape') setIsAddingList(false);
                      }}
                      placeholder="清单名称"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 标签区域 */}
            <div className="mt-6">
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  标签
                </span>
                <button
                  onClick={() => setTagManagerOpen(true)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="管理标签"
                >
                  <Settings size={14} />
                </button>
              </div>
              <div className="space-y-0.5">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagClick(tag.name)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left ${
                      selectedTag === tag.name
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="flex-1 truncate">{tag.name}</span>
                  </button>
                ))}
                {tags.length === 0 && (
                  <div className="px-3 py-2 text-xs text-gray-400">暂无标签</div>
                )}
              </div>
            </div>
          </nav>

          {/* 底部设置 */}
          <div className="p-3 border-t border-gray-200">
            <button className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings size={18} />
              <span>设置</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 侧边栏折叠按钮 - 桌面端 */}
      <button
        onClick={toggleSidebar}
        className="hidden lg:flex fixed z-20 top-4 items-center justify-center w-6 h-6 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
        style={{ left: sidebarOpen ? 'calc(var(--sidebar-width, 260px) - 12px)' : '0px' }}
      >
        {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* 右键菜单 */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-md py-1 min-w-[140px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => {
              const list = lists.find((l) => l.id === contextMenu.listId);
              if (list) {
                setEditingListId(list.id);
                setEditingName(list.name);
              }
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Pencil size={14} />
            重命名
          </button>
          <button
            onClick={() => {
              // 后续可打开颜色选择器
              showToast('颜色编辑功能开发中', 'info');
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Palette size={14} />
            改变颜色
          </button>
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={() => handleDelete(contextMenu.listId)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
            删除
          </button>
        </div>
      )}

      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* 搜索模态框 */}
      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />

      {/* 标签管理模态框 */}
      <TagManager isOpen={tagManagerOpen} onClose={() => setTagManagerOpen(false)} />
    </>
  );
}
