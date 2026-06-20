import { useState } from 'react';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

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
            ←
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
          </h2>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            →
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
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-[80px] p-2 border-b border-r border-gray-200 ${
                day ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              {day && (
                <span
                  className={`inline-flex items-center justify-center w-7 h-7 text-sm rounded-full ${
                    isToday(day)
                      ? 'bg-indigo-500 text-white font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {day}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
