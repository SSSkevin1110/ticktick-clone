import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';

interface DatePickerProps {
  value: string; // YYYY-MM-DD 格式
  onChange: (date: string | undefined) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
}

/**
 * 自定义日期选择器
 * 美观的日历弹窗，替代原生 input[type="date"]
 */
export default function DatePicker({
  value,
  onChange,
  placeholder = '选择日期',
  minDate,
  maxDate,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 获取月份的天数
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // 获取月份第一天是星期几
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // 切换月份
  const changeMonth = (offset: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentMonth(newDate);
  };

  // 格式化日期
  const formatDateStr = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // 格式化显示日期
  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.getTime() === today.getTime()) return '今天';
    if (date.getTime() === tomorrow.getTime()) return '明天';

    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  // 判断是否是今天
  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  };

  // 判断是否是选中日期
  const isSelected = (day: number) => {
    if (!value) return false;
    const selectedDate = new Date(value + 'T00:00:00');
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  // 判断日期是否可选
  const isDateDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = formatDateStr(date);
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  // 快捷日期选项
  const quickDates = [
    { label: '今天', date: formatDateStr(new Date()) },
    { label: '明天', date: formatDateStr(new Date(Date.now() + 86400000)) },
    { label: '后天', date: formatDateStr(new Date(Date.now() + 172800000)) },
    { label: '下周', date: formatDateStr(new Date(Date.now() + 7 * 86400000)) },
  ];

  // 选择日期
  const handleSelectDate = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onChange(formatDateStr(date));
    setIsOpen(false);
  };

  // 清除日期
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div ref={containerRef} className="relative">
      {/* 输入框 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-left"
      >
        <Calendar size={16} className="text-gray-400 flex-shrink-0" />
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="ml-auto p-0.5 text-gray-400 hover:text-gray-600 rounded"
          >
            <X size={14} />
          </button>
        )}
      </button>

      {/* 日历弹窗 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-[slideUp_150ms_ease]">
          {/* 快捷日期 */}
          <div className="flex gap-2 p-3 border-b border-gray-100">
            {quickDates.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  onChange(item.date);
                  setIsOpen(false);
                }}
                className="flex-1 px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* 月份导航 */}
          <div className="flex items-center justify-between px-3 py-2">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={16} className="text-gray-600" />
            </button>
            <span className="text-sm font-semibold text-gray-900">
              {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
            </span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={16} className="text-gray-600" />
            </button>
          </div>

          {/* 星期标题 */}
          <div className="grid grid-cols-7 px-3 mb-1">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* 日期网格 */}
          <div className="grid grid-cols-7 px-3 pb-3">
            {/* 月初空白 */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* 日期 */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const disabled = isDateDisabled(day);
              const today = isToday(day);
              const selected = isSelected(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => !disabled && handleSelectDate(day)}
                  disabled={disabled}
                  className={`
                    w-9 h-9 flex items-center justify-center text-sm rounded-lg transition-all
                    ${disabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}
                    ${today && !selected ? 'font-bold text-indigo-600 bg-indigo-50' : ''}
                    ${selected ? 'bg-indigo-500 text-white font-bold shadow-md hover:bg-indigo-600' : ''}
                    ${!today && !selected ? 'text-gray-700' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* 底部：今天按钮 */}
          <div className="px-3 pb-3">
            <button
              type="button"
              onClick={() => {
                onChange(formatDateStr(new Date()));
                setIsOpen(false);
              }}
              className="w-full py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              今天
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
