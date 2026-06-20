import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import TaskList from '../components/TaskList';
import AddTask from '../components/AddTask';
import { useTaskStore } from '../stores/taskStore';
import { useListStore } from '../stores/listStore';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import type { Priority } from '../types';
import { FolderOpen } from 'lucide-react';

/**
 * 清单详情页面
 * 显示指定清单下的所有任务
 */
export default function ListDetail() {
  const { listId } = useParams<{ listId: string }>();
  const { tasks, isLoading: tasksLoading, createTask, toggleTask, deleteTask } = useTaskStore();
  const { lists, isLoading: listsLoading } = useListStore();
  const { user } = useAuthStore();
  const { selectTask } = useUIStore();

  // 从 listStore 获取清单信息
  const list = useMemo(() => lists.find(l => l.id === listId), [lists, listId]);

  // 获取该清单的任务
  const listTasks = useMemo(
    () => tasks.filter(t => t.listId === listId),
    [tasks, listId]
  );

  // 添加任务
  const handleAddTask = async (newTask: { title: string; priority: Priority; dueDate?: string }) => {
    if (!user?.id || !listId) return;
    await createTask({
      title: newTask.title,
      completed: false,
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      repeatRule: 'none',
      listId,
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

  // 加载状态
  if (tasksLoading || listsLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 清单不存在
  if (!list) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <FolderOpen className="w-12 h-12 mb-4" />
        <p className="text-lg">清单不存在</p>
        <p className="text-sm mt-1">该清单可能已被删除</p>
      </div>
    );
  }

  const pendingCount = listTasks.filter(t => !t.completed).length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* 页面标题 */}
      <div className="px-6 pt-6 pb-4 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
          style={{ backgroundColor: list.color + '20', color: list.color }}
        >
          {list.icon || '📋'}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{list.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pendingCount} 个待完成
          </p>
        </div>
      </div>

      {/* 添加任务 */}
      <AddTask onAdd={handleAddTask} />

      {/* 空状态 */}
      {listTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <FolderOpen className="w-12 h-12 mb-4" />
          <p className="text-lg">清单暂无任务</p>
          <p className="text-sm mt-1">点击上方输入框添加任务</p>
        </div>
      )}

      {/* 任务列表 */}
      {listTasks.length > 0 && (
        <div className="bg-white">
          <TaskList
            tasks={listTasks}
            onToggle={handleToggleTask}
            onDelete={handleDeleteTask}
            onClick={handleClickTask}
          />
        </div>
      )}
    </div>
  );
}
