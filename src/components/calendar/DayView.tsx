import { useMemo, useRef, useEffect, useState } from 'react';
import type { Task } from '../../types';
import { useUIStore } from '../../stores/uiStore';
import { toDateString, getWeekdayName } from '../../lib/dateUtils';

interface DayViewProps {
  tasks: Task[];
  currentDate: Date;
  onDateClick: (date: string) => void;
  onTaskClick: (taskId: string) => void;
}

/**
 * 日视图组件
 * 单日时间轴（0:00~23:00）
 * 任务显示为时间段块
 * 当前时间红线
 * 支持点击创建任务
 */
export default function DayView({
  tasks,
  currentDate,
  onDateClick,
  onTaskClick,
}: DayViewProps) {
  const { selectTask } = useUIStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 每小时行
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // 更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 每分钟更新
    return () => clearInterval(timer);
  }, []);

  // 滚动到当前时间
  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const scrollTo = (now.getHours() - 1) * 64; // 每小时64px
      scrollRef.current.scrollTop = Math.max(0, scrollTo);
    }
  }, []);

  // 获取当天的任务
  const dayTasks = useMemo(() => {
    const dateStr = toDateString(currentDate);
    return tasks.filter((t) => t.dueDate === dateStr);
  }, [tasks, currentDate]);

  // 获取某小时的任务
  const getTasksForHour = (hour: number): Task[] => {
    return dayTasks.filter((t) => {
      if (!t.dueTime) return false;
      const taskHour = parseInt(t.dueTime.split(':')[0], 10);
      return taskHour === hour;
    });
  };

  // 计算当前时间红线位置
  const currentTimePosition = useMemo(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return hours * 64 + (minutes / 60) * 64; // 每小时64px
  }, [currentTime]);

  // 处理时间段点击
  const handleTimeSlotClick = (_hour: number) => {
    const dateStr = toDateString(currentDate);
    onDateClick(dateStr);
  };

  // 判断是否是今天
  const isToday = useMemo(() => {
    const today = new Date();
    return (
      currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  }, [currentDate]);

  const weekday = getWeekdayName(currentDate);
  const dayNum = currentDate.getDate();
  const month = currentDate.getMonth() + 1;

  return (
    <div className="w-full flex flex-col h-[calc(100vh-200px)]">
      {/* 日期标题 */}
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${
              isToday ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <span className="text-xs font-medium">{weekday}</span>
            <span className="text-lg font-bold leading-tight">{dayNum}</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {currentDate.getFullYear()}年{month}月{dayNum}日
            </h2>
            <p className="text-sm text-gray-500">
              {dayTasks.length > 0 ? `${dayTasks.length} 个任务` : '暂无任务'}
            </p>
          </div>
        </div>
      </div>

      {/* 时间轴区域 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="flex">
          {/* 左侧时间刻度 */}
          <div className="w-14 flex-shrink-0">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-16 border-b border-gray-100 flex items-start justify-end pr-2 pt-0"
              >
                <span className="text-[10px] text-gray-400 -mt-2">
                  {hour === 0 ? '' : `${hour}:00`}
                </span>
              </div>
            ))}
          </div>

          {/* 时间轴内容 */}
          <div className="flex-1 border-l border-gray-200 relative">
            {hours.map((hour) => {
              const hourTasks = getTasksForHour(hour);

              return (
                <div
                  key={hour}
                  className="h-16 border-b border-gray-100 relative cursor-pointer hover:bg-gray-50/50"
                  onClick={() => handleTimeSlotClick(hour)}
                >
                  {/* 任务块 */}
                  {hourTasks.map((task) => {
                    // 解析分钟位置
                    const minutes = task.dueTime
                      ? parseInt(task.dueTime.split(':')[1], 10)
                      : 0;
                    const topOffset = (minutes / 60) * 64;

                    return (
                      <div
                        key={task.id}
                        className={`absolute left-1 right-1 px-3 py-2 rounded-lg text-sm ${
                          task.completed
                            ? 'bg-gray-200 text-gray-500 line-through'
                            : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        }`}
                        style={{ top: `${topOffset}px`, minHeight: '24px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectTask(task.id);
                          onTaskClick(task.id);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {task.dueTime && (
                            <span className="text-xs text-indigo-500">{task.dueTime}</span>
                          )}
                          <span className="truncate">{task.title}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* 当前时间红线 */}
            {isToday && (
              <div
                className="absolute left-0 right-0 z-10 pointer-events-none"
                style={{ top: `${currentTimePosition}px` }}
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
                  <div className="flex-1 h-px bg-red-500" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
