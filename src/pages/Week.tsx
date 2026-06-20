import { useMemo } from 'react';
import TaskList from '../components/TaskList';
import AddTask from '../components/AddTask';
import { useTaskStore } from '../stores/taskStore';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import type { Priority } from '../types';
/**
 * 最近7天页面
 * 按日期分组显示最近7天的任务
 */
export default function Week() {
  const { tasks, isLoading, createTask, toggleTask, deleteTask } = useTaskStore();
  const { user } = useAuthStore();
  const { selectTask } = useUIStore();

  // 添加任务
  const handleAddTask = async (newTask: { title: string; priority: Priority; dueDate?: string }) => {
    if (!user?.id) return;
    await createTask({
      title: newTask.title,
      completed: false,
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      repeatRule: 'none',
      listId: '',
      tags: [],
    }, user.id);
  };

  const handleToggleTask = (id: string) => {
    toggleTask(id);
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
  };

  const handleClickTask = (id: string) => {
    selectTask(id);
  };

  // 获取未来7天的日期
  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = useMemo(() => getWeekDates(), []);

  // 按日期字符串过滤任务
  const getTasksByDateString = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => task.dueDate === dateStr);
  };

  // 格式化日期标题
  const formatDateHeader = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return '今天';
    if (date.toDateString() === tomorrow.toDateString()) return '明天';

    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
  };

  // 无日期任务
  const noDateTasks = useMemo(() => tasks.filter(t => !t.dueDate), [tasks]);

  // 加载骨架屏
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="px-6 pt-6 pb-4">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-100 rounded mt-2 animate-pulse" />
        </div>
        <div className="space-y-4 px-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-6 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-16 bg-gray-50 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* 页面标题 */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-semibold text-gray-900">最近7天</h1>
        <p className="text-sm text-gray-500 mt-1">查看和管理本周任务</p>
      </div>

      {/* 添加任务 */}
      <AddTask onAdd={handleAddTask} />

      {/* 按日期分组的任务列表 */}
      <div className="bg-white">
        {weekDates.map((date) => {
          const dateTasks = getTasksByDateString(date);
          return (
            <div key={date.toISOString()} className="border-b border-gray-100 last:border-0">
              {/* 日期标题 */}
              <div className="px-6 py-3 bg-gray-50 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {formatDateHeader(date)}
                </span>
                <span className="text-xs text-gray-500">
                  {date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                </span>
              </div>

              {/* 该日期的任务 */}
              {dateTasks.length > 0 ? (
                <TaskList
                  tasks={dateTasks}
                  onToggle={handleToggleTask}
                  onDelete={handleDeleteTask}
                  onClick={handleClickTask}
                />
              ) : (
                <div className="px-6 py-4 text-sm text-gray-400 text-center">
                  暂无任务
                </div>
              )}
            </div>
          );
        })}

        {/* 无日期任务 */}
        {noDateTasks.length > 0 && (
          <div>
            <div className="px-6 py-3 bg-gray-50">
              <span className="text-sm font-medium text-gray-700">无日期</span>
            </div>
            <TaskList
              tasks={noDateTasks}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
              onClick={handleClickTask}
            />
          </div>
        )}
      </div>
    </div>
  );
}
