import { useEffect } from 'react';
import { LayoutGrid } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useTaskStore } from '../stores/taskStore';
import MatrixView from '../components/matrix/MatrixView';

/**
 * 艾森豪威尔矩阵页面
 * - 显示 MatrixView 组件
 * - 点击任务跳转到详情
 */
export default function Matrix() {
  const { user } = useAuthStore();
  const { tasks, fetchTasks, isLoading } = useTaskStore();

  // 初始化时获取任务数据
  useEffect(() => {
    if (user?.id) {
      fetchTasks(user.id);
    }
  }, [user?.id, fetchTasks]);

  // 监听矩阵任务点击事件
  useEffect(() => {
    const handleTaskClick = (e: Event) => {
      const customEvent = e as CustomEvent;
      const taskId = customEvent.detail?.taskId;
      if (taskId) {
        // 触发 UIStore 的任务选中
        const event = new CustomEvent('select-task', { detail: { taskId } });
        window.dispatchEvent(event);
      }
    };

    window.addEventListener('matrix-task-click', handleTaskClick);
    return () => window.removeEventListener('matrix-task-click', handleTaskClick);
  }, []);

  // 加载骨架屏
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="px-6 pt-6 pb-4">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-100 rounded mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-xl animate-pulse min-h-[200px]">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="space-y-2">
                <div className="h-10 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 页面标题 */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-semibold text-gray-900">艾森豪威尔矩阵</h1>
        <p className="text-sm text-gray-500 mt-1">按紧急和重要程度分类任务，高效管理时间</p>
      </div>

      {/* 矩阵视图 */}
      <div className="px-6 pb-6">
        {tasks.filter((t) => !t.completed).length === 0 ? (
          /* 空状态 */
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <LayoutGrid className="w-12 h-12 mb-4" />
            <p className="text-lg">暂无未完成任务</p>
            <p className="text-sm mt-1">添加任务后，它们会自动分类到矩阵中</p>
          </div>
        ) : (
          <MatrixView tasks={tasks} />
        )}
      </div>
    </div>
  );
}
