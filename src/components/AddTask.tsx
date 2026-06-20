import { useState } from 'react';
import DatePicker from './DatePicker';
import type { Priority } from '../types';

interface AddTaskProps {
  onAdd: (task: { title: string; priority: Priority; dueDate?: string }) => void;
}

export default function AddTask({ onAdd }: AddTaskProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('none');
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd({
        title: title.trim(),
        priority,
        dueDate,
      });
      setTitle('');
      setPriority('none');
      setDueDate(undefined);
      setIsExpanded(false);
    }
  };

  const getPriorityButtonClass = (p: Priority) => {
    const baseClass = 'px-2 py-1 text-xs rounded transition-colors';
    if (priority === p) {
      switch (p) {
        case 'high': return `${baseClass} bg-red-100 text-red-700 border border-red-300`;
        case 'medium': return `${baseClass} bg-yellow-100 text-yellow-700 border border-yellow-300`;
        case 'low': return `${baseClass} bg-blue-100 text-blue-700 border border-blue-300`;
        default: return `${baseClass} bg-gray-100 text-gray-700 border border-gray-300`;
      }
    }
    return `${baseClass} bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100`;
  };

  return (
    <div className="border-b border-gray-200 bg-white">
      <form onSubmit={handleSubmit} className="p-4">
        {/* 主输入行 */}
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="添加任务..."
            className="flex-1 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
          />
          {title.trim() && (
            <button
              type="submit"
              className="px-3 py-1.5 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 transition-colors"
            >
              添加
            </button>
          )}
        </div>

        {/* 展开的选项 */}
        {isExpanded && (
          <div className="mt-3 flex items-center gap-4 pl-8">
            {/* 优先级选择 */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500 mr-1">优先级:</span>
              <button
                type="button"
                onClick={() => setPriority('none')}
                className={getPriorityButtonClass('none')}
              >
                无
              </button>
              <button
                type="button"
                onClick={() => setPriority('low')}
                className={getPriorityButtonClass('low')}
              >
                低
              </button>
              <button
                type="button"
                onClick={() => setPriority('medium')}
                className={getPriorityButtonClass('medium')}
              >
                中
              </button>
              <button
                type="button"
                onClick={() => setPriority('high')}
                className={getPriorityButtonClass('high')}
              >
                高
              </button>
            </div>

            {/* 日期选择 */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500 mr-1">日期:</span>
              <DatePicker
                value={dueDate || ''}
                onChange={setDueDate}
                placeholder="选择日期"
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
