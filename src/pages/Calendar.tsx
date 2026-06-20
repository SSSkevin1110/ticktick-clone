import { useState } from 'react';
import { useTaskStore } from '../stores/taskStore';
import { useUIStore } from '../stores/uiStore';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import MonthView from '../components/calendar/MonthView';
import WeekView from '../components/calendar/WeekView';
import DayView from '../components/calendar/DayView';
import AgendaView from '../components/calendar/AgendaView';
import { getWeekDates } from '../lib/dateUtils';

/** 日历视图类型 */
type CalendarViewType = 'month' | 'week' | 'day' | 'agenda';

/** 视图切换按钮配置 */
const viewButtons: { key: CalendarViewType; label: string }[] = [
  { key: 'month', label: '月' },
  { key: 'week', label: '周' },
  { key: 'day', label: '日' },
  { key: 'agenda', label: '议程' },
];

/**
 * 日历页面
 * 支持月/周/日/议程四种视图
 * 集成多视图切换、月份导航、今天按钮等功能
 */
export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<CalendarViewType>('month');
  const { tasks } = useTaskStore();
  const { selectTask } = useUIStore();

  // 切换月份
  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  // 切换周
  const changeWeek = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset * 7);
    setCurrentDate(newDate);
  };

  // 切换日
  const changeDay = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset);
    setCurrentDate(newDate);
  };

  // 回到今天
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 处理日期点击
  const handleDateClick = (date: string) => {
    // 如果在周视图或日视图，可以切换到该日期
    if (viewType === 'week' || viewType === 'day') {
      setCurrentDate(new Date(date + 'T00:00:00'));
    }
  };

  // 处理任务点击
  const handleTaskClick = (taskId: string) => {
    selectTask(taskId);
  };

  // 获取当前视图的标题
  const getViewTitle = () => {
    switch (viewType) {
      case 'month':
        return `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`;
      case 'week': {
        const weekDates = getWeekDates(currentDate);
        const start = weekDates[0];
        const end = weekDates[6];
        if (start.getMonth() === end.getMonth()) {
          return `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日 - ${end.getDate()}日`;
        }
        return `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`;
      }
      case 'day':
        return `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月${currentDate.getDate()}日`;
      case 'agenda':
        return '议程';
      default:
        return '';
    }
  };

  // 导航处理
  const handlePrev = () => {
    switch (viewType) {
      case 'month':
        changeMonth(-1);
        break;
      case 'week':
        changeWeek(-1);
        break;
      case 'day':
        changeDay(-1);
        break;
    }
  };

  const handleNext = () => {
    switch (viewType) {
      case 'month':
        changeMonth(1);
        break;
      case 'week':
        changeWeek(1);
        break;
      case 'day':
        changeDay(1);
        break;
    }
  };

  return (
    <div className="w-full px-6 py-6">
      {/* 页面标题 */}
      <div className="pt-6 pb-2">
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>日历</h1>
        </div>

        {/* 视图切换 + 导航栏 */}
        <div className="flex items-center justify-between">
          {/* 左侧：视图切换按钮 */}
          <div className="flex items-center gap-1 rounded-lg p-1" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
            {viewButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => setViewType(btn.key)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewType === btn.key
                    ? 'shadow-sm'
                    : ''
                }`}
                style={{
                  backgroundColor: viewType === btn.key ? 'var(--color-bg-primary)' : 'transparent',
                  color: viewType === btn.key ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* 右侧：导航 + 今天按钮 */}
          <div className="flex items-center gap-2">
            {/* 今天按钮 */}
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm rounded-lg transition-colors font-medium"
              style={{ color: 'var(--color-primary)' }}
            >
              今天
            </button>

            {/* 前后导航 */}
            {viewType !== 'agenda' && (
              <div className="flex items-center">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-semibold min-w-[140px] text-center" style={{ color: 'var(--color-text-primary)' }}>
                  {getViewTitle()}
                </span>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* 议程视图时显示标题 */}
            {viewType === 'agenda' && (
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {getViewTitle()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 视图内容 */}
      <div className="mt-4">
        {viewType === 'month' && (
          <div>
            {/* 星期标题行 */}
            <div className="grid grid-cols-7 mb-2">
              {['一', '二', '三', '四', '五', '六', '日'].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium py-2"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  {day}
                </div>
              ))}
            </div>
            <MonthView
              tasks={tasks}
              currentDate={currentDate}
              onDateClick={handleDateClick}
              onTaskClick={handleTaskClick}
            />
          </div>
        )}

        {viewType === 'week' && (
          <WeekView
            tasks={tasks}
            currentDate={currentDate}
            onDateClick={handleDateClick}
            onTaskClick={handleTaskClick}
          />
        )}

        {viewType === 'day' && (
          <DayView
            tasks={tasks}
            currentDate={currentDate}
            onDateClick={handleDateClick}
            onTaskClick={handleTaskClick}
          />
        )}

        {viewType === 'agenda' && (
          <AgendaView
            tasks={tasks}
            onTaskClick={handleTaskClick}
          />
        )}
      </div>
    </div>
  );
}
