import { useState, useMemo } from 'react';
import TaskList from '../components/TaskList';
import AddTask from '../components/AddTask';
import SortMenu from '../components/SortMenu';
import FilterBar from '../components/FilterBar';
import type { QuickFilter } from '../components/FilterBar';
import { useTaskStore } from '../stores/taskStore';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import type { Priority } from '../types';
import { ListTodo, ArrowUpDown } from 'lucide-react';

/**
 * 全部任务页面
 * 显示所有任务，区分待完成和已完成
 * 支持排序和快速过滤
 */
export default function AllTasks() {
  const { tasks, isLoading, createTask, toggleTask, deleteTask, sortBy, sortOrder, setSortBy, setSortOrder, getSortedTasks, getWeekTasks } = useTaskStore();
  const { user } = useAuthStore();
  const { selectTask } = useUIStore();

  // 排序菜单状态
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  // 快速过滤状态
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');

  // 获取本周到期的任务
  const weekTasks = useMemo(() => getWeekTasks(), [getWeekTasks]);

  // 根据过滤和排序获取任务
  const filteredTasks = useMemo(() => {
    let result = getSortedTasks();

    switch (quickFilter) {
      case 'highPriority':
        result = result.filter((t) => t.priority === 'high');
        break;
      case 'dueThisWeek':
        result = result.filter((t) => weekTasks.some((wt) => wt.id === t.id));
        break;
      case 'completed':
        result = result.filter((t) => t.completed);
        break;
      // 'all' 不做过滤
    }

    return result;
  }, [getSortedTasks, quickFilter, weekTasks]);

  // 按完成状态分组（使用过滤后的任务）
  const pendingTasks = useMemo(() => filteredTasks.filter(t => !t.completed), [filteredTasks]);
  const completedTasks = useMemo(() => filteredTasks.filter(t => t.completed), [filteredTasks]);

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

  // 获取排序方式显示文本
  const getSortLabel = () => {
    const sortNames: Record<string, string> = {
      priority: '优先级',
      dueDate: '截止日期',
      title: '标题',
      createdAt: '创建时间',
    };
    const orderNames: Record<string, string> = {
      asc: '升序',
      desc: '降序',
    };
    return `${sortNames[sortBy]} · ${orderNames[sortOrder]}`;
  };

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

      {/* 排序和过滤工具栏 */}
      {tasks.length > 0 && (
        <div className="px-6 pb-3 flex items-center gap-3 flex-wrap">
          <FilterBar currentFilter={quickFilter} onFilterChange={setQuickFilter} />

          {/* 排序按钮 */}
          <div className="relative ml-auto">
            <button
              onClick={() => setSortMenuOpen(!sortMenuOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                sortBy !== 'dueDate' || sortOrder !== 'asc'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>排序</span>
            </button>
            <SortMenu
              isOpen={sortMenuOpen}
              onClose={() => setSortMenuOpen(false)}
              currentSort={sortBy}
              currentOrder={sortOrder}
              onSortChange={(newSort, newOrder) => {
                setSortBy(newSort);
                setSortOrder(newOrder);
              }}
            />
          </div>
        </div>
      )}

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
                sortLabel={getSortLabel()}
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
