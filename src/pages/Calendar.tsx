import { useState, useMemo } from 'react';
import { useTaskStore } from '../stores/taskStore';
import { useUIStore } from '../stores/uiStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * 日历页面
 * 月视图日历，显示任务标记，点击查看当天任务
 */
export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { tasks } = useTaskStore();
  const { selectTask } = useUIStore();

  // 获取当月的天数
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // 获取当月第一天是星期几
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // 切换月份
  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  // 判断是否是今天
  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };

  // 获取某天的任务数量
  const getTaskCountForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(t => t.dueDate === dateStr).length;
  };

  // 获取某天的任务列表
  const getTasksForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(t => t.dueDate === dateStr);
  };

  // 格式化选中日期
  const formatSelectedDate = (day: number) => {
    return `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月${day}日`;
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  // 星期标题
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  // 生成日历网格
  const calendarDays = [];
  // 填充月初空白
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  // 填充日期
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // 选中日期的任务
  const selectedDayTasks = useMemo(() => {
    if (!selectedDate) return [];
    const day = parseInt(selectedDate.split('-')[2], 10);
    return getTasksForDay(day);
  }, [selectedDate, tasks]);

  return (
    <div className="max-w-3xl mx-auto">
      {/* 页面标题 */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-semibold text-gray-900">日历</h1>
      </div>

      {/* 日历主体 */}
      <div className="px-6">
        {/* 月份导航 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
          </h2>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 星期标题行 */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* 日期网格 */}
        <div className="grid grid-cols-7 border-t border-l border-gray-200">
          {calendarDays.map((day, index) => {
            const taskCount = day ? getTaskCountForDay(day) : 0;
            const dayStr = day ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
            const isSelected = dayStr && selectedDate === dayStr;

            return (
              <div
                key={index}
                className={`min-h-[80px] p-2 border-b border-r border-gray-200 cursor-pointer transition-colors ${
                  day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                } ${isSelected ? 'bg-indigo-50' : ''}`}
                onClick={() => day && setSelectedDate(dayStr === selectedDate ? null : dayStr!)}
              >
                {day && (
                  <>
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 text-sm rounded-full ${
                        isToday(day)
                          ? 'bg-indigo-500 text-white font-medium'
                          : isSelected
                            ? 'bg-indigo-100 text-indigo-700 font-medium'
                            : 'text-gray-700'
                      }`}
                    >
                      {day}
                    </span>

                    {/* 任务标记点 */}
                    {taskCount > 0 && (
                      <div className="mt-1 flex items-center justify-center">
                        <div className="flex gap-0.5">
                          {taskCount <= 3 ? (
                            Array.from({ length: taskCount }).map((_, i) => (
                              <div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                              />
                            ))
                          ) : (
                            <span className="text-[10px] text-indigo-600 font-medium">
                              {taskCount}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 选中日期的任务列表 */}
      {selectedDate && (
        <div className="px-6 mt-6">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">
                {formatSelectedDate(parseInt(selectedDate.split('-')[2], 10))}
                {selectedDayTasks.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    ({selectedDayTasks.length} 个任务)
                  </span>
                )}
              </h3>
            </div>

            {selectedDayTasks.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                这天没有任务
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {selectedDayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => selectTask(task.id)}
                  >
                    <div className="flex items-center gap-3">
                      {/* 复选框 */}
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          task.completed
                            ? 'bg-indigo-500 border-indigo-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {task.completed && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      {/* 任务信息 */}
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                          {task.title}
                        </span>
                        {task.priority !== 'none' && (
                          <span className={`ml-2 text-xs ${
                            task.priority === 'high' ? 'text-red-500' :
                            task.priority === 'medium' ? 'text-yellow-500' :
                            'text-blue-500'
                          }`}>
                            {task.priority === 'high' ? '!!!' : task.priority === 'medium' ? '!!' : '!'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
