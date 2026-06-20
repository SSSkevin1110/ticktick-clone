import { useMemo } from 'react';
import type { Task } from '../../types';

interface MatrixViewProps {
  tasks: Task[];
}

interface Quadrant {
  title: string;
  subtitle: string;
  bgColor: string;
  borderColor: string;
  headerBg: string;
  tasks: Task[];
}

/**
 * 艾森豪威尔矩阵组件
 * 将任务按紧急和重要程度分为四个象限：
 * - 第一象限（紧急+重要）：红色，"立即做"
 * - 第二象限（重要+不紧急）：蓝色，"计划做"
 * - 第三象限（紧急+不重要）：黄色，"委托做"
 * - 第四象限（不紧急+不重要）：灰色，"删除"
 */
export default function MatrixView({ tasks }: MatrixViewProps) {

  // 判断是否紧急：dueDate 在今天或已过期
  const isUrgent = (task: Task): boolean => {
    if (!task.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate <= today;
  };

  // 判断是否重要：priority 为 high 或 medium
  const isImportant = (task: Task): boolean => {
    return task.priority === 'high' || task.priority === 'medium';
  };

  // 将任务分类到四个象限
  const quadrants = useMemo<Quadrant[]>(() => {
    const q1: Task[] = []; // 紧急 + 重要
    const q2: Task[] = []; // 不紧急 + 重要
    const q3: Task[] = []; // 紧急 + 不重要
    const q4: Task[] = []; // 不紧急 + 不重要

    // 只处理未完成的任务
    const incompleteTasks = tasks.filter((t) => !t.completed);

    for (const task of incompleteTasks) {
      const urgent = isUrgent(task);
      const important = isImportant(task);

      if (urgent && important) {
        q1.push(task);
      } else if (!urgent && important) {
        q2.push(task);
      } else if (urgent && !important) {
        q3.push(task);
      } else {
        q4.push(task);
      }
    }

    return [
      {
        title: '立即做',
        subtitle: '紧急 + 重要',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        headerBg: 'bg-red-100 text-red-800',
        tasks: q1,
      },
      {
        title: '计划做',
        subtitle: '重要 + 不紧急',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        headerBg: 'bg-blue-100 text-blue-800',
        tasks: q2,
      },
      {
        title: '委托做',
        subtitle: '紧急 + 不重要',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        headerBg: 'bg-yellow-100 text-yellow-800',
        tasks: q3,
      },
      {
        title: '删除',
        subtitle: '不紧急 + 不重要',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        headerBg: 'bg-gray-100 text-gray-800',
        tasks: q4,
      },
    ];
  }, [tasks]);

  // 点击任务跳转
  const handleTaskClick = (task: Task) => {
    // 通过 URL 参数传递任务 ID，由上层页面处理
    const event = new CustomEvent('matrix-task-click', { detail: { taskId: task.id } });
    window.dispatchEvent(event);
  };

  // 优先级颜色映射
  const priorityColors: Record<string, string> = {
    high: 'bg-red-400',
    medium: 'bg-amber-400',
    low: 'bg-blue-400',
    none: 'bg-gray-300',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {quadrants.map((quadrant, index) => (
        <div
          key={index}
          className={`rounded-xl border ${quadrant.borderColor} ${quadrant.bgColor} overflow-hidden`}
        >
          {/* 象限标题 */}
          <div className={`px-4 py-3 ${quadrant.headerBg}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm">{quadrant.title}</h3>
                <p className="text-xs opacity-75">{quadrant.subtitle}</p>
              </div>
              <span className="text-xs font-medium bg-white/50 px-2 py-0.5 rounded-full">
                {quadrant.tasks.length}
              </span>
            </div>
          </div>

          {/* 任务列表 */}
          <div className="p-3 min-h-[120px] max-h-[300px] overflow-y-auto">
            {quadrant.tasks.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[80px] text-gray-400 text-sm">
                暂无任务
              </div>
            ) : (
              <div className="space-y-2">
                {quadrant.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className="flex items-start gap-2 p-2.5 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    {/* 优先级指示器 */}
                    <div
                      className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${priorityColors[task.priority]}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                      {task.dueDate && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(task.dueDate).toLocaleDateString('zh-CN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
