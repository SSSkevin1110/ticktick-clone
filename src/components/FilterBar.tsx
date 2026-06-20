import { ListFilter, AlertTriangle, CalendarCheck, CheckCircle2 } from 'lucide-react';

/** 快速过滤类型 */
export type QuickFilter = 'all' | 'highPriority' | 'dueThisWeek' | 'completed';

interface FilterBarProps {
  currentFilter: QuickFilter;
  onFilterChange: (filter: QuickFilter) => void;
}

/**
 * 快速过滤栏组件
 * 水平按钮组，显示常用过滤选项
 */
export default function FilterBar({ currentFilter, onFilterChange }: FilterBarProps) {
  // 过滤选项配置
  const filterOptions: { value: QuickFilter; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: '全部', icon: <ListFilter className="w-3.5 h-3.5" /> },
    { value: 'highPriority', label: '高优先级', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { value: 'dueThisWeek', label: '本周到期', icon: <CalendarCheck className="w-3.5 h-3.5" /> },
    { value: 'completed', label: '已完成', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {filterOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onFilterChange(option.value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
            option.value === currentFilter
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {option.icon}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
