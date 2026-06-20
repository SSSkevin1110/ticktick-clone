import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { PriorityData } from '../../stores/statsStore';

/** 优先级分布饼图属性 */
interface PriorityPieChartProps {
  data: PriorityData[];
  total: number;
}

/** 优先级颜色映射 */
const PRIORITY_COLORS: Record<string, string> = {
  高优先级: '#EF4444',   // red-500
  中优先级: '#F97316',   // orange-500
  低优先级: '#3B82F6',   // blue-500
  无优先级: '#9CA3AF',   // gray-400
};

/**
 * 优先级分布饼图
 * 展示四个优先级的任务分布，中间显示总数
 */
export default function PriorityPieChart({ data, total }: PriorityPieChartProps) {
  // 过滤掉数量为 0 的项
  const filteredData = data.filter((d) => d.count > 0);

  // 自定义 tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2">
          <p className="text-xs text-gray-500">{item.name}</p>
          <p className="text-sm font-medium" style={{ color: item.payload.fill }}>
            {item.value} 个任务 ({percent}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">优先级分布</h3>

      {filteredData.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
          暂无数据
        </div>
      ) : (
        <div className="flex items-center gap-4">
          {/* 饼图 */}
          <div className="relative h-[200px] w-[200px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filteredData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="priority"
                >
                  {filteredData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PRIORITY_COLORS[entry.priority] || '#9CA3AF'}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* 中间总数 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="text-2xl font-bold text-gray-800">{total}</span>
                <span className="block text-xs text-gray-500">总计</span>
              </div>
            </div>
          </div>

          {/* 图例 */}
          <div className="flex-1 space-y-2">
            {filteredData.map((item) => {
              const percent = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
              return (
                <div key={item.priority} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: PRIORITY_COLORS[item.priority] || '#9CA3AF',
                    }}
                  />
                  <span className="text-xs text-gray-600 flex-1">{item.priority}</span>
                  <span className="text-xs font-medium text-gray-800">
                    {item.count}
                  </span>
                  <span className="text-xs text-gray-400">({percent}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
