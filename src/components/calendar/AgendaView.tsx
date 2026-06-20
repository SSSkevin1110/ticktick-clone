import { useState, useMemo } from 'react';
import type { Task } from '../../types';
import { useUIStore } from '../../stores/uiStore';
import { useListStore } from '../../stores/listStore';
import { formatRelativeDate, toDateString, parseDate } from '../../lib/dateUtils';
import { Calendar } from 'lucide-react';

interface AgendaViewProps {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
}

/**
 * 议程视图组件
 * 按日期分组的任务列表
 * 显示未来30天的任务
 * 每天一个分组，显示日期标题
 * 无任务的日期不显示
 * 底部"加载更多"按钮
 * 任务显示：标题 + 清单名 + 优先级 + 时间
 */
export default function AgendaView({ tasks, onTaskClick }: AgendaViewProps) {
  const { selectTask } = useUIStore();
  const { lists } = useListStore();
  const [visibleDays, setVisibleDays] = useState(7); // 初始显示7天

  // 获取清单名称
  const getListName = (listId: string): string => {
    const list = lists.find((l) => l.id === listId);
    return list?.name || '';
  };

  // 获取清单颜色
  const getListColor = (listId: string): string => {
    const list = lists.find((l) => l.id === listId);
    return list?.color || '#6B7280';
  };

  // 按日期分组的任务
  const groupedTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 获取未来30天的日期
    const futureDates: string[] = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      futureDates.push(toDateString(date));
    }

    // 按日期分组
    const groups: { date: string; tasks: Task[] }[] = [];

    for (const dateStr of futureDates) {
      const dayTasks = tasks.filter(
        (t) => t.dueDate === dateStr && !t.completed
      );
      if (dayTasks.length > 0) {
        // 按时间排序
        dayTasks.sort((a, b) => {
          if (!a.dueTime && !b.dueTime) return 0;
          if (!a.dueTime) return 1;
          if (!b.dueTime) return -1;
          return a.dueTime.localeCompare(b.dueTime);
        });
        groups.push({ date: dateStr, tasks: dayTasks });
      }
    }

    return groups;
  }, [tasks]);

  // 可见的日期组
  const visibleGroups = useMemo(() => {
    return groupedTasks.slice(0, visibleDays);
  }, [groupedTasks, visibleDays]);

  // 还有更多吗
  const hasMore = visibleDays < groupedTasks.length;

  // 加载更多
  const loadMore = () => {
    setVisibleDays((prev) => Math.min(prev + 7, groupedTasks.length));
  };

  // 优先级样式
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-gray-400';
    }
  };

  // 优先级图标
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '!!!';
      case 'medium':
        return '!!';
      case 'low':
        return '!';
      default:
        return '';
    }
  };

  if (groupedTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Calendar className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg">未来30天暂无任务</p>
        <p className="text-sm mt-1">点击日历中的日期来创建新任务</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 标题 */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">议程</h2>
        <p className="text-sm text-gray-500">
          显示未来{visibleDays}天的任务
        </p>
      </div>

      {/* 日期分组列表 */}
      <div className="space-y-4">
        {visibleGroups.map((group) => {
          const date = parseDate(group.date);
          const relativeDate = formatRelativeDate(group.date);
          const isToday =
            toDateString(date) === toDateString(new Date());

          return (
            <div key={group.date} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* 日期标题 */}
              <div
                className={`px-4 py-2.5 border-b border-gray-100 ${
                  isToday ? 'bg-indigo-50' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        isToday ? 'text-indigo-600' : 'text-gray-700'
                      }`}
                    >
                      {relativeDate}
                    </span>
                    {!isToday && (
                      <span className="text-xs text-gray-400">
                        {group.date}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {group.tasks.length} 个任务
                  </span>
                </div>
              </div>

              {/* 任务列表 */}
              <div className="divide-y divide-gray-100">
                {group.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      selectTask(task.id);
                      onTaskClick(task.id);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* 复选框 */}
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          task.completed
                            ? 'bg-indigo-500 border-indigo-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {task.completed && (
                          <svg
                            className="w-2.5 h-2.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>

                      {/* 任务信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm ${
                              task.completed
                                ? 'line-through text-gray-400'
                                : 'text-gray-900'
                            }`}
                          >
                            {task.title}
                          </span>
                          {task.priority !== 'none' && (
                            <span
                              className={`text-xs font-bold ${getPriorityStyle(
                                task.priority
                              )}`}
                            >
                              {getPriorityIcon(task.priority)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {/* 清单名称 */}
                          {task.listId && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${getListColor(task.listId)}20`,
                                color: getListColor(task.listId),
                              }}
                            >
                              {getListName(task.listId)}
                            </span>
                          )}
                          {/* 时间 */}
                          {task.dueTime && (
                            <span className="text-xs text-gray-400">
                              {task.dueTime}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 加载更多按钮 */}
      {hasMore && (
        <div className="flex justify-center mt-6 mb-8">
          <button
            onClick={loadMore}
            className="px-6 py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
          >
            加载更多
          </button>
        </div>
      )}
    </div>
  );
}
