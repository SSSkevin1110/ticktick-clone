
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { TrendData } from '../../stores/statsStore';

/** 完成趋势图表属性 */
interface CompletionChartProps {
  data: TrendData[];
  onRangeChange: (days: number) => void;
  currentRange: number;
}

/** 时间范围选项 */
const rangeOptions = [
  { label: '7天', days: 7 },
  { label: '30天', days: 30 },
  { label: '90天', days: 90 },
];

/**
 * 完成趋势图表
 * 使用 recharts AreaChart 展示每日完成任务数趋势
 */
export default function CompletionChart({
  data,
  onRangeChange,
  currentRange,
}: CompletionChartProps) {
  // 格式化日期显示（MM/DD）
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // 自定义 tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2">
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-sm font-medium text-indigo-600">
            完成 {payload[0].value} 个任务
          </p>
        </div>
      );
    }
    return null;
  };

  // 获取今天的日期字符串
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      {/* 标题和时间范围选择 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">完成趋势</h3>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {rangeOptions.map((option) => (
            <button
              key={option.days}
              onClick={() => onRangeChange(option.days)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                currentRange === option.days
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 图表 */}
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
              interval={currentRange <= 7 ? 0 : currentRange <= 30 ? 4 : 9}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* 今日标记线 */}
            <ReferenceLine
              x={today}
              stroke="#6366F1"
              strokeDasharray="3 3"
              label={{
                value: '今日',
                position: 'top',
                fontSize: 11,
                fill: '#6366F1',
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#6366F1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
