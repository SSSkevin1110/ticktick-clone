import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import PomodoroTimer from '../components/pomodoro/PomodoroTimer';
import PomodoroStats from '../components/pomodoro/PomodoroStats';
import { usePomodoroStore } from '../stores/pomodoroStore';
import { useTaskStore } from '../stores/taskStore';
import { useAuthStore } from '../stores/authStore';

/**
 * 番茄钟页面
 * - 左侧：PomodoroTimer 主计时器
 * - 右侧：PomodoroStats 统计
 * - 底部可选择关联任务
 */
export default function Pomodoro() {
  const { user } = useAuthStore();
  const { tasks, fetchTasks } = useTaskStore();
  const {
    currentTaskId,
    setCurrentTaskId,
    fetchSessions,
    isRunning,
    isBreak,
    startPomodoro,
  } = usePomodoroStore();

  const [showTaskSelector, setShowTaskSelector] = useState(false);

  // 初始化时获取数据
  useEffect(() => {
    if (user?.id) {
      fetchTasks(user.id);
      fetchSessions(user.id);
    }
  }, [user?.id, fetchTasks, fetchSessions]);

  // 当前关联的任务
  const currentTask = tasks.find((t) => t.id === currentTaskId);

  // 未完成的任务列表（用于选择关联）
  const incompleteTasks = tasks.filter((t) => !t.completed);

  // 选择任务并开始番茄钟
  const handleSelectAndStart = (taskId: string) => {
    setCurrentTaskId(taskId);
    setShowTaskSelector(false);
    if (!isRunning && !isBreak) {
      startPomodoro(taskId);
    }
  };

  // 取消关联
  const handleClearTask = () => {
    setCurrentTaskId(null);
    setShowTaskSelector(false);
  };

  return (
    <div className="w-full px-6 py-6">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">番茄钟</h1>
        <p className="text-sm text-gray-500 mt-1">专注工作，高效休息</p>
      </div>

      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧：计时器 */}
        <div className="flex flex-col items-center">
          <PomodoroTimer />

          {/* 关联任务选择 */}
          <div className="mt-8 w-full max-w-xs">
            <div className="relative">
              <button
                onClick={() => setShowTaskSelector(!showTaskSelector)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm hover:bg-gray-100 transition-colors"
              >
                <span className="truncate">
                  {currentTask ? currentTask.title : '选择关联任务（可选）'}
                </span>
                <ChevronDown size={16} className="text-gray-400 flex-shrink-0 ml-2" />
              </button>

              {/* 下拉列表 */}
              {showTaskSelector && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <button
                    onClick={handleClearTask}
                    className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 border-b border-gray-100"
                  >
                    不关联任务
                  </button>
                  {incompleteTasks.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-400 text-center">
                      暂无未完成任务
                    </div>
                  ) : (
                    incompleteTasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => handleSelectAndStart(task.id)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          currentTaskId === task.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                        }`}
                      >
                        <div className="truncate">{task.title}</div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧：统计 */}
        <div>
          <PomodoroStats />
        </div>
      </div>
    </div>
  );
}
