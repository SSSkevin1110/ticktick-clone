import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Clock, ArrowRight, Calendar, Tag } from 'lucide-react';
import { useTaskStore } from '../stores/taskStore';
import { useListStore } from '../stores/listStore';
import { useUIStore } from '../stores/uiStore';

/** 搜索历史存储 key */
const SEARCH_HISTORY_KEY = 'ticktick_search_history';
/** 最大历史记录数 */
const MAX_HISTORY_COUNT = 5;

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 搜索模态框
 * - 全屏半透明遮罩
 * - 大输入框，自动聚焦
 * - 实时搜索（debounce 300ms）
 * - 搜索结果列表（任务标题 + 清单名 + 日期）
 * - 点击结果跳转到任务
 * - Escape 关闭
 * - 显示搜索历史（最近5条）
 */
export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { tasks } = useTaskStore();
  const { lists } = useListStore();
  const { selectTask } = useUIStore();

  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // 加载搜索历史
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (saved) {
        setSearchHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('加载搜索历史失败:', e);
    }
  }, []);

  // 自动聚焦输入框
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setDebouncedQuery('');
    }
  }, [isOpen]);

  // Escape 键关闭
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 打开时锁定 body 滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Debounce 搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // 执行搜索（不区分大小写）
  const searchResults = useCallback(() => {
    if (!debouncedQuery.trim()) return [];
    const queryLower = debouncedQuery.toLowerCase();
    return tasks.filter((task) => {
      const titleMatch = task.title.toLowerCase().includes(queryLower);
      const descMatch = task.description?.toLowerCase().includes(queryLower) || false;
      return titleMatch || descMatch;
    });
  }, [tasks, debouncedQuery]);

  const results = searchResults();

  // 保存搜索历史
  const saveToHistory = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    const newHistory = [
      searchQuery.trim(),
      ...searchHistory.filter((h) => h !== searchQuery.trim()),
    ].slice(0, MAX_HISTORY_COUNT);
    setSearchHistory(newHistory);
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error('保存搜索历史失败:', e);
    }
  };

  // 清除搜索历史
  const clearHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (e) {
      console.error('清除搜索历史失败:', e);
    }
  };

  // 点击搜索结果
  const handleResultClick = (taskId: string) => {
    saveToHistory(query);
    selectTask(taskId);
    onClose();
  };

  // 点击搜索历史
  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
  };

  // 获取清单名称
  const getListName = (listId: string) => {
    const list = lists.find((l) => l.id === listId);
    return list?.name || '未分类';
  };

  // 格式化日期
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
      onClick={onClose}
    >
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/50 animate-[fadeIn_150ms_ease]" />

      {/* 搜索框容器 */}
      <div
        className="relative w-full max-w-[600px] mx-4 bg-white rounded-xl shadow-2xl animate-[slideUp_200ms_ease] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 搜索输入框 */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200">
          <Search size={20} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索任务..."
            className="flex-1 text-lg text-gray-900 outline-none placeholder-gray-400 bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* 搜索结果或历史记录 */}
        <div className="max-h-[50vh] overflow-y-auto">
          {debouncedQuery.trim() ? (
            /* 搜索结果 */
            results.length > 0 ? (
              <div className="py-2">
                {results.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => handleResultClick(task.id)}
                    className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">{getListName(task.listId)}</span>
                        {task.dueDate && (
                          <>
                            <span className="text-gray-300">|</span>
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Calendar size={10} />
                              {formatDate(task.dueDate)}
                            </span>
                          </>
                        )}
                        {task.tags.length > 0 && (
                          <>
                            <span className="text-gray-300">|</span>
                            <span className="flex items-center gap-1 text-xs text-indigo-500">
                              <Tag size={10} />
                              {task.tags[0]}
                              {task.tags.length > 1 && ` +${task.tags.length - 1}`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-gray-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-400 text-sm">
                未找到匹配的任务
              </div>
            )
          ) : (
            /* 搜索历史 */
            <div className="py-2">
              {searchHistory.length > 0 && (
                <>
                  <div className="flex items-center justify-between px-5 py-2">
                    <span className="text-xs font-medium text-gray-500">最近搜索</span>
                    <button
                      onClick={clearHistory}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      清除
                    </button>
                  </div>
                  {searchHistory.map((historyQuery, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistoryClick(historyQuery)}
                      className="w-full flex items-center gap-3 px-5 py-2.5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <Clock size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{historyQuery}</span>
                    </button>
                  ))}
                </>
              )}
              {searchHistory.length === 0 && (
                <div className="py-12 text-center text-gray-400 text-sm">
                  输入关键词开始搜索
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 flex items-center gap-4">
          <span>
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">Enter</kbd> 搜索
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">Esc</kbd> 关闭
          </span>
        </div>
      </div>
    </div>
  );
}
