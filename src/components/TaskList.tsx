import { useState } from 'react';
import type { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (id: string) => void;
}

export default function TaskList({ tasks, onToggle, onDelete, onClick }: TaskListProps) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-400';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return '今天';
    if (date.toDateString() === tomorrow.toDateString()) return '明天';

    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <span className="text-5xl mb-4">📝</span>
        <p className="text-lg">暂无任务</p>
        <p className="text-sm mt-1">点击上方按钮添加新任务</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="group flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => onClick?.(task.id)}
        >
          {/* 复选框 */}
          <button
            onClick={() => onToggle(task.id)}
            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              task.completed
                ? 'bg-indigo-500 border-indigo-500'
                : 'border-gray-300 hover:border-indigo-500'
            }`}
          >
            {task.completed && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          {/* 任务内容 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-sm ${getPriorityColor(task.priority)}`}>
                {task.priority === 'high' ? '!!!' : task.priority === 'medium' ? '!!' : task.priority === 'low' ? '!' : ''}
              </span>
              <span className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                {task.title}
              </span>
            </div>

            {/* 任务详情 */}
            {(task.dueDate || task.description) && (
              <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                {task.dueDate && (
                  <span className="flex items-center gap-1">
                    📅 {formatDate(task.dueDate)}
                  </span>
                )}
                {task.description && (
                  <span className="flex items-center gap-1 truncate">
                    📝 {task.description}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <button
              onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 text-gray-400 hover:text-red-500 rounded"
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
