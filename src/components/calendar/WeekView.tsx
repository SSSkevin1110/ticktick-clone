import { useMemo, useRef, useEffect, useState } from 'react';
import type { Task } from '../../types';
import { useUIStore } from '../../stores/uiStore';
import {
  getWeekDates,
  isToday,
  toDateString,
  getWeekdayName,
} from '../../lib/dateUtils';

interface WeekViewProps {
  tasks: Task[];
  currentDate: Date;
  onDateClick: (date: string) => void;
  onTaskClick: (taskId: string) => void;
}

/**
 * 周视图组件
 * 7列布局，每列代表一天
 * 顶部显示日期标题（周一~周日 + 日期）
 * 左侧时间刻度（0:00~23:00，每小时一行）
 * 任务显示为时间块（根据 dueTime 定位）
 * 今天列高亮
 * 支持点击空白时间段创建任务
 */
export default function WeekView({
  tasks,
  currentDate,
  onDateClick,
  onTaskClick,
}: WeekViewProps) {
  const { selectTask } = useUIStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 获取一周的日期
  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);

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
      const scrollTo = (now.getHours() - 1) * 48; // 每小时48px
      scrollRef.current.scrollTop = Math.max(0, scrollTo);
    }
  }, []);

  // 获取某天某小时的任务
  const getTasksForHour = (date: Date, hour: number): Task[] => {
    const dateStr = toDateString(date);
    return tasks.filter((t) => {
      if (t.dueDate !== dateStr || !t.dueTime) return false;
      const taskHour = parseInt(t.dueTime.split(':')[0], 10);
      return taskHour === hour;
    });
  };

  // 计算当前时间红线位置
  const currentTimePosition = useMemo(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return hours * 48 + (minutes / 60) * 48; // 每小时48px
  }, [currentTime]);

  // 处理时间段点击
  const handleTimeSlotClick = (date: Date, _hour: number) => {
    const dateStr = toDateString(date);
    onDateClick(dateStr);
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-200px)]">
      {/* 日期标题行 */}
      <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10">
        {/* 左侧时间列标题 */}
        <div className="w-14 flex-shrink-0"></div>
        {/* 7列日期标题 */}
        {weekDates.map((date) => {
          const isTodayDate = isToday(date);
          const weekday = getWeekdayName(date);
          const dayNum = date.getDate();

          return (
            <div
              key={toDateString(date)}
              className={`flex-1 text-center py-2 border-l border-gray-200 ${
                isTodayDate ? 'bg-indigo-50' : ''
              }`}
            >
              <div className="text-xs text-gray-500">{weekday}</div>
              <div
                className={`text-lg font-semibold mt-0.5 ${
                  isTodayDate ? 'text-indigo-600' : 'text-gray-900'
                }`}
              >
                {dayNum}
              </div>
            </div>
          );
        })}
      </div>

      {/* 时间轴区域 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto relative">
        <div className="flex">
          {/* 左侧时间刻度 */}
          <div className="w-14 flex-shrink-0">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-12 border-b border-gray-100 flex items-start justify-end pr-2 pt-0"
              >
                <span className="text-[10px] text-gray-400 -mt-2">
                  {hour === 0 ? '' : `${hour}:00`}
                </span>
              </div>
            ))}
          </div>

          {/* 7列日期内容 */}
          {weekDates.map((date) => {
            const isTodayDate = isToday(date);
            const dateStr = toDateString(date);

            return (
              <div
                key={dateStr}
                className={`flex-1 border-l border-gray-200 relative ${
                  isTodayDate ? 'bg-indigo-50/30' : ''
                }`}
              >
                {hours.map((hour) => {
                  const hourTasks = getTasksForHour(date, hour);

                  return (
                    <div
                      key={`${dateStr}-${hour}`}
                      className="h-12 border-b border-gray-100 relative cursor-pointer hover:bg-gray-50/50"
                      onClick={() => handleTimeSlotClick(date, hour)}
                    >
                      {/* 任务块 */}
                      {hourTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`absolute left-0.5 right-0.5 top-0.5 px-1.5 py-0.5 rounded text-[10px] truncate ${
                            task.completed
                              ? 'bg-gray-200 text-gray-500 line-through'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectTask(task.id);
                            onTaskClick(task.id);
                          }}
                          title={task.title}
                        >
                          {task.title}
                        </div>
                      ))}
                    </div>
                  );
                })}

                {/* 当前时间红线 */}
                {isTodayDate && (
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
