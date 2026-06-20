import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/** 统计卡片属性 */
interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  trend?: { value: number; isPositive: boolean };
  color?: 'indigo' | 'green' | 'yellow' | 'red';
}

/** 颜色映射 */
const colorMap = {
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'text-indigo-500',
    value: 'text-indigo-600',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-500',
    value: 'text-green-600',
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-500',
    value: 'text-yellow-600',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-500',
    value: 'text-red-600',
  },
};

/**
 * 统计卡片组件
 * 显示图标 + 标题 + 数值 + 可选趋势指示
 */
export default function StatCard({
  icon,
  title,
  value,
  trend,
  color = 'indigo',
}: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* 标题 */}
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {/* 数值 */}
          <p className={`text-3xl font-bold mt-1 ${colors.value}`}>{value}</p>
        </div>
        {/* 图标 */}
        <div className={`p-3 rounded-lg ${colors.bg}`}>
          <div className={colors.icon}>{icon}</div>
        </div>
      </div>

      {/* 趋势指示 */}
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          {trend.isPositive ? (
            <TrendingUp size={14} className="text-green-500" />
          ) : (
            <TrendingDown size={14} className="text-red-500" />
          )}
          <span
            className={`text-xs font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.value}%
          </span>
          <span className="text-xs text-gray-400">较上周</span>
        </div>
      )}
    </div>
  );
}
