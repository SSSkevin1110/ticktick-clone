import { Pin, Pencil, Trash2 } from 'lucide-react';
import type { Countdown } from '../../types';

interface CountdownCardProps {
  countdown: Countdown;
  onTogglePin: (id: string) => void;
  onEdit: (countdown: Countdown) => void;
  onDelete: (id: string) => void;
}

/**
 * 计算两个日期之间的天数差
 */
function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA);
  const b = new Date(dateB);
  // 重置时间为午夜，只比较日期
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  const diff = b.getTime() - a.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

/**
 * 获取日期状态信息
 * - 已过期：红色调
 * - 今天：金色调
 * - 未来：蓝色调
 */
function getDateStatus(targetDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: `已过${Math.abs(diffDays)}天`, type: 'expired' as const, days: Math.abs(diffDays) };
  } else if (diffDays === 0) {
    return { label: '今天！', type: 'today' as const, days: 0 };
  } else {
    return { label: `还有${diffDays}天`, type: 'future' as const, days: diffDays };
  }
}

/**
 * 倒计时卡片组件
 * - 标题 + 图标
 * - 目标日期
 * - 剩余天数（大数字显示）
 * - 进度条（从创建到目标的进度）
 * - 置顶按钮
 * - 编辑/删除按钮
 */
export default function CountdownCard({ countdown, onTogglePin, onEdit, onDelete }: CountdownCardProps) {
  const status = getDateStatus(countdown.targetDate);

  // 计算进度百分比（从创建到目标的进度）
  const now = new Date();

  const totalDays = daysBetween(countdown.createdAt, countdown.targetDate);
  const elapsedDays = daysBetween(countdown.createdAt, now.toISOString());

  // 进度限制在 0-100 之间
  const progress = totalDays > 0
    ? Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100)
    : 100;

  // 根据状态设置颜色主题
  const themeStyles = {
    expired: {
      border: 'border-red-200',
      bg: 'bg-red-50',
      numberColor: 'text-red-600',
      labelBg: 'bg-red-100 text-red-700',
      progressBg: 'bg-red-400',
    },
    today: {
      border: 'border-amber-200',
      bg: 'bg-amber-50',
      numberColor: 'text-amber-600',
      labelBg: 'bg-amber-100 text-amber-700',
      progressBg: 'bg-amber-400',
    },
    future: {
      border: 'border-blue-200',
      bg: 'bg-blue-50',
      numberColor: 'text-blue-600',
      labelBg: 'bg-blue-100 text-blue-700',
      progressBg: 'bg-blue-400',
    },
  }[status.type];

  // 格式化目标日期
  const formattedDate = new Date(countdown.targetDate).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className={`relative rounded-xl border ${themeStyles.border} ${themeStyles.bg} p-5 transition-all hover:shadow-md`}
    >
      {/* 操作按钮 */}
      <div className="absolute top-3 right-3 flex items-center gap-1">
        <button
          onClick={() => onTogglePin(countdown.id)}
          className={`p-1.5 rounded-lg transition-colors ${
            countdown.isPinned
              ? 'bg-indigo-100 text-indigo-600'
              : 'text-gray-400 hover:text-indigo-500 hover:bg-gray-100'
          }`}
          title={countdown.isPinned ? '取消置顶' : '置顶'}
        >
          <Pin size={14} fill={countdown.isPinned ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={() => onEdit(countdown)}
          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-lg transition-colors"
          title="编辑"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(countdown.id)}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-colors"
          title="删除"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* 图标和标题 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{countdown.icon}</span>
        <span className="font-medium text-gray-900 truncate pr-20">{countdown.title}</span>
      </div>

      {/* 大数字显示 */}
      <div className="mb-3">
        <div className={`text-4xl font-bold ${themeStyles.numberColor}`}>
          {status.type === 'today' ? '!' : status.days}
        </div>
        <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${themeStyles.labelBg}`}>
          {status.label}
        </span>
      </div>

      {/* 目标日期 */}
      <div className="text-xs text-gray-500 mb-3">
        目标日期：{formattedDate}
      </div>

      {/* 进度条 */}
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${themeStyles.progressBg}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
