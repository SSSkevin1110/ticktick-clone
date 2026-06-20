import { useEffect, useRef } from 'react';
import type { SortBy, SortOrder } from '../types';
import { ArrowUp, ArrowDown, Check } from 'lucide-react';

interface SortMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentSort: SortBy;
  currentOrder: SortOrder;
  onSortChange: (sortBy: SortBy, order: SortOrder) => void;
}

/**
 * 排序菜单组件
 * 下拉菜单，显示排序选项，支持切换排序方式和排序方向
 */
export default function SortMenu({ isOpen, onClose, currentSort, currentOrder, onSortChange }: SortMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 排序选项
  const sortOptions: { value: SortBy; label: string; icon: string }[] = [
    { value: 'priority', label: '优先级', icon: '🔴' },
    { value: 'dueDate', label: '截止日期', icon: '📅' },
    { value: 'title', label: '标题', icon: '🔤' },
    { value: 'createdAt', label: '创建时间', icon: '🕐' },
  ];

  // 排序方向选项
  const orderOptions: { value: SortOrder; label: string; icon: React.ReactNode }[] = [
    { value: 'asc', label: '升序', icon: <ArrowUp className="w-4 h-4" /> },
    { value: 'desc', label: '降序', icon: <ArrowDown className="w-4 h-4" /> },
  ];

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-1 z-50 bg-white rounded-lg shadow-lg border border-gray-200 w-56"
    >
      {/* 排序方式 */}
      <div className="p-2">
        <div className="px-2 py-1 text-xs font-medium text-gray-400 uppercase tracking-wider">
          排序方式
        </div>
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => {
              if (option.value === currentSort) {
                // 点击当前选中的排序方式，切换排序方向
                onSortChange(option.value, currentOrder === 'asc' ? 'desc' : 'asc');
              } else {
                // 切换排序方式，保持当前排序方向
                onSortChange(option.value, currentOrder);
              }
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
              option.value === currentSort
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{option.icon}</span>
              <span>{option.label}</span>
            </div>
            {option.value === currentSort && (
              <Check className="w-4 h-4 text-indigo-500" />
            )}
          </button>
        ))}
      </div>

      {/* 分隔线 */}
      <div className="border-t border-gray-100 mx-2" />

      {/* 排序方向 */}
      <div className="p-2">
        <div className="px-2 py-1 text-xs font-medium text-gray-400 uppercase tracking-wider">
          排序方向
        </div>
        {orderOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onSortChange(currentSort, option.value)}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
              option.value === currentOrder
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              {option.icon}
              <span>{option.label}</span>
            </div>
            {option.value === currentOrder && (
              <Check className="w-4 h-4 text-indigo-500" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
