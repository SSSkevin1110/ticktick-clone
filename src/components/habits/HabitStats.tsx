import { useMemo } from 'react';
import { Flame, Trophy, Target, TrendingUp } from 'lucide-react';
import type { Habit, HabitLog } from '../../types';
import { useHabitStore } from '../../stores/habitStore';

interface HabitStatsProps {
  habit: Habit;
  logs: HabitLog[];
}

/**
 * 习惯统计组件
 * - 连续打卡天数（Streak）
 * - 最长连续天数
 * - 总完成次数
 * - 完成率百分比
 * - 最近30天热力图（类似GitHub贡献图，7行x5列）
 */
export default function HabitStats({ habit, logs }: HabitStatsProps) {
  const { getStreak, getCompletionRate } = useHabitStore();

  // 当前连续天数
  const currentStreak = getStreak(habit.id);

  // 最近30天完成率
  const completionRate = getCompletionRate(habit.id, 30);

  // 总完成次数
  const totalCompletions = useMemo(() => {
    return logs.filter((l) => l.completed).length;
  }, [logs]);

  // 最长连续天数
  const longestStreak = useMemo(() => {
    const completedLogs = logs
      .filter((l) => l.completed)
      .map((l) => l.logDate)
      .sort();

    if (completedLogs.length === 0) return 0;

    let maxStreak = 1;
    let currentStreakCount = 1;

    for (let i = 1; i < completedLogs.length; i++) {
      const prevDate = new Date(completedLogs[i - 1]);
      const currDate = new Date(completedLogs[i]);
      const diffDays = Math.round(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        currentStreakCount++;
        maxStreak = Math.max(maxStreak, currentStreakCount);
      } else if (diffDays > 1) {
        currentStreakCount = 1;
      }
    }

    return maxStreak;
  }, [logs]);

  // 最近30天热力图数据
  const heatmapData = useMemo(() => {
    const data: { date: string; completed: boolean; level: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 构建完成日期集合
    const completedDates = new Set(
      logs.filter((l) => l.completed).map((l) => l.logDate)
    );

    // 生成最近30天数据（从30天前到今天）
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const completed = completedDates.has(dateStr);
      data.push({
        date: dateStr,
        completed,
        level: completed ? 1 : 0,
      });
    }

    return data;
  }, [logs]);

  // 热力图颜色等级
  const getHeatmapColor = (level: number) => {
    if (level === 0) return 'bg-gray-100';
    return 'bg-green-500';
  };

  // 统计卡片
  const stats = [
    {
      icon: Flame,
      label: '连续天数',
      value: `${currentStreak}`,
      unit: '天',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      icon: Trophy,
      label: '最长连续',
      value: `${longestStreak}`,
      unit: '天',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: Target,
      label: '总完成次数',
      value: `${totalCompletions}`,
      unit: '次',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: TrendingUp,
      label: '30天完成率',
      value: `${completionRate}`,
      unit: '%',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-4">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bgColor} rounded-xl p-4`}
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={16} className={stat.color} />
              <span className="text-xs text-gray-600">{stat.label}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
              <span className="text-sm text-gray-500">{stat.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 热力图 */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="text-sm font-medium text-gray-700 mb-3">最近30天打卡记录</div>
        <div className="grid grid-cols-7 gap-1.5">
          {heatmapData.map((day) => (
            <div
              key={day.date}
              className={`w-3 h-3 rounded-sm ${getHeatmapColor(day.level)} transition-colors`}
              title={`${day.date}: ${day.completed ? '已完成' : '未完成'}`}
            />
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 mt-3 text-xs text-gray-500">
          <span>少</span>
          <div className="w-3 h-3 rounded-sm bg-gray-100" />
          <div className="w-3 h-3 rounded-sm bg-green-500" />
          <span>多</span>
        </div>
      </div>
    </div>
  );
}
