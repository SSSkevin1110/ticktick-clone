import { useMemo } from 'react';
import TaskList from '../components/TaskList';
import AddTask from '../components/AddTask';
import { useTaskStore } from '../stores/taskStore';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import type { Priority } from '../types';
import { Sun } from 'lucide-react';

/**
 * 今天页面
 * 显示今天的任务，支持添加、完成、删除
 */
export default function Today() {
  const { tasks, isLoading, createTask, toggleTask, deleteTask, getTodayTasks } = useTaskStore();
  const { user } = useAuthStore();
  const { selectTask } = useUIStore();

  // 获取今天的任务
  const todayTasks = useMemo(() => getTodayTasks(), [tasks]);

  // 添加任务（默认今天日期）
  const handleAddTask = async (newTask: { title: string; priority: Priority; dueDate?: string }) => {
    if (!user?.id) return;
    const today = new Date().toISOString().split('T')[0];
    await createTask({
      title: newTask.title,
      completed: false,
      priority: newTask.priority,
      dueDate: newTask.dueDate || today,
      repeatRule: 'none',
      listId: 'default',
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

  // 格式化今天日期
  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  // 加载骨架屏
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="px-6 pt-6 pb-4">
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-40 bg-gray-100 rounded mt-2 animate-pulse" />
        </div>
        <div className="space-y-3 px-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg animate-pulse">
              <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
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
        <h1 className="text-2xl font-semibold text-gray-900">今天</h1>
        <p className="text-sm text-gray-500 mt-1">{dateStr}</p>
      </div>

      {/* 添加任务 */}
      <AddTask onAdd={handleAddTask} />

      {/* 空状态 */}
      {todayTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Sun className="w-12 h-12 mb-4" />
          <p className="text-lg">今天没有任务</p>
          <p className="text-sm mt-1">享受轻松的一天，或添加新任务</p>
        </div>
      )}

      {/* 任务列表 */}
      {todayTasks.length > 0 && (
        <div className="bg-white">
          <TaskList
            tasks={todayTasks}
            onToggle={handleToggleTask}
            onDelete={handleDeleteTask}
            onClick={handleClickTask}
          />
        </div>
      )}
    </div>
  );
}
