import { useMemo } from 'react';
import type { Task } from '../../types';
import { useUIStore } from '../../stores/uiStore';
import { getMonthDates, isToday, toDateString } from '../../lib/dateUtils';

interface MonthViewProps {
  tasks: Task[];
  currentDate: Date;
  onDateClick: (date: string) => void;
  onTaskClick: (taskId: string) => void;
}

/**
 * 月视图组件
 * 显示月历网格，日期格子中展示任务标记
 * 优化：在日期格子中显示任务标题（最多2个，多余显示+N）
 */
export default function MonthView({
  tasks,
  currentDate,
  onDateClick,
  onTaskClick,
}: MonthViewProps) {
  const { selectTask } = useUIStore();

  // 获取月历网格
  const monthDates = useMemo(() => getMonthDates(currentDate), [currentDate]);

  // 获取某天的任务
  const getTasksForDate = (date: Date): Task[] => {
    const dateStr = toDateString(date);
    return tasks.filter((t) => t.dueDate === dateStr);
  };

  return (
    <div className="w-full">
      {/* 日期网格 */}
      <div className="grid grid-cols-7 border-t border-l border-gray-200">
        {monthDates.map((item, index) => {
          const dateStr = toDateString(item.date);
          const dayTasks = getTasksForDate(item.date);
          const isTodayDate = isToday(item.date);
          const isSelected = dateStr === toDateString(currentDate);

          return (
            <div
              key={index}
              className={`min-h-[100px] p-2 border-b border-r border-gray-200 cursor-pointer transition-colors ${
                item.isCurrentMonth
                  ? 'bg-white hover:bg-gray-50'
                  : 'bg-gray-50'
              } ${isSelected ? 'bg-indigo-50' : ''}`}
              onClick={() => onDateClick(dateStr)}
            >
              {/* 日期数字 */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`inline-flex items-center justify-center w-7 h-7 text-sm rounded-full ${
                    isTodayDate
                      ? 'bg-indigo-500 text-white font-medium'
                      : isSelected
                        ? 'bg-indigo-100 text-indigo-700 font-medium'
                        : item.isCurrentMonth
                          ? 'text-gray-700'
                          : 'text-gray-400'
                  }`}
                >
                  {item.date.getDate()}
                </span>
                {dayTasks.length > 3 && (
                  <span className="text-[10px] text-gray-400">+{dayTasks.length - 2}</span>
                )}
              </div>

              {/* 任务列表（最多显示2个） */}
              {dayTasks.length > 0 && item.isCurrentMonth && (
                <div className="space-y-0.5">
                  {dayTasks.slice(0, 2).map((task) => (
                    <div
                      key={task.id}
                      className={`px-1.5 py-0.5 rounded text-[10px] truncate ${
                        task.completed
                          ? 'bg-gray-100 text-gray-400 line-through'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectTask(task.id);
                        onTaskClick(task.id);
                      }}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
