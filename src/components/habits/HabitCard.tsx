import { useState, useRef, useEffect } from 'react';
import { Check, Pencil, Trash2, Flame } from 'lucide-react';
import type { Habit, HabitLog } from '../../types';
import { useHabitStore } from '../../stores/habitStore';

interface HabitCardProps {
  habit: Habit;
  logs: HabitLog[];
  onToggle: (habitId: string, date: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

/**
 * 习惯卡片组件
 * - 左侧：图标（emoji）+ 颜色圆点
 * - 中间：习惯名称 + 连续天数
 * - 右侧：打卡按钮（圆形，点击切换）
 * - 下方：最近7天的打卡状态
 * - 右键菜单：编辑/删除
 */
export default function HabitCard({ habit, logs, onToggle, onEdit, onDelete }: HabitCardProps) {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const { getStreak } = useHabitStore();

  // 今天日期
  const today = new Date().toISOString().split('T')[0];

  // 今天是否已打卡
  const isCompletedToday = logs.some((l) => l.logDate === today && l.completed);

  // 连续天数
  const streak = getStreak(habit.id);

  // 最近7天的打卡状态
  const getLast7Days = () => {
    const days = [];
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const date = new Date(todayDate);
      date.setDate(todayDate.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayLogs = logs.filter((l) => l.logDate === dateStr && l.completed);
      days.push({
        date: dateStr,
        completed: dayLogs.length > 0,
        isToday: i === 0,
      });
    }
    return days;
  };

  const last7Days = getLast7Days();

  // 点击外部关闭右键菜单
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setShowContextMenu(false);
      }
    };
    if (showContextMenu) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showContextMenu]);

  // 右键菜单
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  // 星期标签
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <>
      <div
        className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
        onContextMenu={handleContextMenu}
      >
        <div className="flex items-center gap-3">
          {/* 左侧：图标 + 颜色圆点 */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">{habit.icon}</span>
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: habit.color }}
            />
          </div>

          {/* 中间：习惯名称 + 连续天数 */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">{habit.name}</div>
            {streak > 0 && (
              <div className="flex items-center gap-1 text-sm text-orange-500 mt-0.5">
                <Flame size={14} />
                <span>{streak} 天连续</span>
              </div>
            )}
          </div>

          {/* 右侧：打卡按钮 */}
          <button
            onClick={() => onToggle(habit.id, today)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isCompletedToday
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            {isCompletedToday ? <Check size={18} /> : null}
          </button>
        </div>

        {/* 最近7天打卡状态 */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          {last7Days.map((day) => (
            <div key={day.date} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-gray-400">
                {weekDays[new Date(day.date).getDay()]}
              </span>
              <div
                className={`w-3 h-3 rounded-full border-2 transition-colors ${
                  day.completed
                    ? 'border-green-500 bg-green-500'
                    : day.isToday
                    ? 'border-gray-400 bg-white'
                    : 'border-gray-200 bg-white'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 右键菜单 */}
      {showContextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-md py-1 min-w-[120px]"
          style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
        >
          <button
            onClick={() => {
              onEdit(habit);
              setShowContextMenu(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Pencil size={14} />
            编辑
          </button>
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={() => {
              onDelete(habit.id);
              setShowContextMenu(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
            删除
          </button>
        </div>
      )}
    </>
  );
}
