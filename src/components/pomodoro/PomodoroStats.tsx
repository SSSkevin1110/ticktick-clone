import { useMemo } from 'react';
import { Clock, Target, TrendingUp } from 'lucide-react';
import { usePomodoroStore } from '../../stores/pomodoroStore';
import type { PomodoroSession } from '../../types';

/**
 * 获取星期几的中文名
 */
function getDayLabel(dateStr: string): string {
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  const d = new Date(dateStr);
  return days[d.getDay()];
}

/**
 * 格式化时间为 HH:mm
 */
function formatTime(isoStr: string): string {
  const d = new Date(isoStr);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * 格式化日期为 MM-DD
 */
function formatDate(isoStr: string): string {
  const d = new Date(isoStr);
  return `${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}

/**
 * 番茄钟统计组件
 * - 今日完成番茄数和专注时长
 * - 本周趋势柱状图
 * - 最近完成的番茄记录
 */
export default function PomodoroStats() {
  const { sessions, getTodayStats, getWeekStats } = usePomodoroStore();

  const todayStats = useMemo(() => getTodayStats(), [sessions]);
  const weekStats = useMemo(() => getWeekStats(), [sessions]);

  // 最近完成的记录（最多10条）
  const recentSessions = useMemo(() => {
    return sessions
      .filter((s) => s.isCompleted)
      .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))
      .slice(0, 10);
  }, [sessions]);

  // 本周最大番茄数（用于柱状图缩放）
  const maxCount = Math.max(...weekStats.map((s) => s.count), 1);

  return (
    <div className="space-y-6">
      {/* 今日统计卡片 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-indigo-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <Target size={18} />
            <span className="text-sm font-medium">今日番茄</span>
          </div>
          <div className="text-3xl font-bold text-indigo-700">{todayStats.completedCount}</div>
          <div className="text-xs text-indigo-500 mt-1">个已完成</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <Clock size={18} />
            <span className="text-sm font-medium">专注时长</span>
          </div>
          <div className="text-3xl font-bold text-green-700">{todayStats.totalMinutes}</div>
          <div className="text-xs text-green-500 mt-1">分钟</div>
        </div>
      </div>

      {/* 本周趋势 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">本周趋势</span>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-end justify-between gap-2" style={{ height: 100 }}>
            {weekStats.map((stat) => (
              <div key={stat.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500">{stat.count}</span>
                <div
                  className="w-full bg-indigo-400 rounded-t-md transition-all duration-300"
                  style={{
                    height: `${(stat.count / maxCount) * 60}px`,
                    minHeight: stat.count > 0 ? '4px' : '0px',
                  }}
                />
                <span className="text-xs text-gray-500">{getDayLabel(stat.date)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 最近记录 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">最近记录</h3>
        {recentSessions.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            暂无完成的番茄记录
          </div>
        ) : (
          <div className="space-y-2">
            {recentSessions.map((session) => (
              <SessionItem key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 单条番茄记录
 */
function SessionItem({ session }: { session: PomodoroSession }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
        <Target size={14} className="text-green-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          {session.durationMinutes} 分钟专注
        </div>
        <div className="text-xs text-gray-500">
          {session.completedAt ? formatTime(session.completedAt) : '--:--'} ·{' '}
          {session.completedAt ? formatDate(session.completedAt) : '--'}
        </div>
      </div>
      {session.taskId && (
        <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
          关联任务
        </span>
      )}
    </div>
  );
}
