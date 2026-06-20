import { useMemo } from 'react';
import TaskList from '../components/TaskList';
import AddTask from '../components/AddTask';
import { useTaskStore } from '../stores/taskStore';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import type { Priority } from '../types';
import { ListTodo } from 'lucide-react';

/**
 * 全部任务页面
 * 显示所有任务，区分待完成和已完成
 */
export default function AllTasks() {
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
      listId: 'default',
      tags: [],
    }, user.id);
  };

  // 切换任务完成状态
  const handleToggleTask = (id: string) => {
    toggleTask(id);
  };

  // 删除任务
  const handleDeleteTask = (id: string) => {
    deleteTask(id);
  };

  // 点击任务打开详情
  const handleClickTask = (id: string) => {
    selectTask(id);
  };

  // 按完成状态分组
  const pendingTasks = useMemo(() => tasks.filter(t => !t.completed), [tasks]);
  const completedTasks = useMemo(() => tasks.filter(t => t.completed), [tasks]);

  // 加载骨架屏
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="px-6 pt-6 pb-4">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-100 rounded mt-2 animate-pulse" />
        </div>
        <div className="space-y-3 px-6">
          {[1, 2, 3, 4].map((i) => (
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
        <h1 className="text-2xl font-semibold text-gray-900">全部任务</h1>
        <p className="text-sm text-gray-500 mt-1">
          {pendingTasks.length} 个待完成，{completedTasks.length} 个已完成
        </p>
      </div>

      {/* 添加任务 */}
      <AddTask onAdd={handleAddTask} />

      {/* 空状态 */}
      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <ListTodo className="w-12 h-12 mb-4" />
          <p className="text-lg">暂无任务</p>
          <p className="text-sm mt-1">点击上方输入框添加你的第一个任务</p>
        </div>
      )}

      {/* 任务列表 */}
      {tasks.length > 0 && (
        <div className="bg-white">
          {/* 待完成任务 */}
          {pendingTasks.length > 0 && (
            <div>
              <div className="px-6 py-2 bg-gray-50">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  待完成 ({pendingTasks.length})
                </span>
              </div>
              <TaskList
                tasks={pendingTasks}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
                onClick={handleClickTask}
              />
            </div>
          )}

          {/* 已完成任务 */}
          {completedTasks.length > 0 && (
            <div>
              <div className="px-6 py-2 bg-gray-50">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  已完成 ({completedTasks.length})
                </span>
              </div>
              <TaskList
                tasks={completedTasks}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
                onClick={handleClickTask}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
