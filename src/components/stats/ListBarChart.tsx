import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { ListData } from '../../stores/statsStore';
import { useListStore } from '../../stores/listStore';

/** 清单分布柱状图属性 */
interface ListBarChartProps {
  data: ListData[];
}

/**
 * 清单分布柱状图
 * 展示各清单的任务数量，使用堆叠柱状图显示完成/未完成
 */
export default function ListBarChart({ data }: ListBarChartProps) {
  const { lists } = useListStore();

  // 获取清单颜色
  const getListColor = (listId: string): string => {
    const list = lists.find((l) => l.id === listId);
    return list?.color || '#6366F1';
  };

  // 准备图表数据，添加颜色和未完成数
  const chartData = data.map((item) => ({
    ...item,
    listName:
      item.listId === 'default'
        ? '默认清单'
        : lists.find((l) => l.id === item.listId)?.name || item.listId,
    pendingCount: item.count - item.completedCount,
    color: getListColor(item.listId),
  }));

  // 自定义 tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const completed = payload.find((p: any) => p.dataKey === 'completedCount');
      const pending = payload.find((p: any) => p.dataKey === 'pendingCount');
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2">
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          {completed && (
            <p className="text-xs text-green-600">
              已完成: {completed.value}
            </p>
          )}
          {pending && (
            <p className="text-xs text-gray-500">
              待完成: {pending.value}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // 自定义图例
  const CustomLegend = () => (
    <div className="flex items-center justify-center gap-4 mt-2">
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-green-500" />
        <span className="text-xs text-gray-500">已完成</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-gray-300" />
        <span className="text-xs text-gray-500">待完成</span>
      </div>
    </div>
  );

  // 格式化清单名称（过长截断）
  const formatListName = (name: string) => {
    return name.length > 6 ? name.slice(0, 6) + '...' : name;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">清单分布</h3>

      {chartData.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
          暂无数据
        </div>
      ) : (
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="listName"
                tickFormatter={formatListName}
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              <Bar
                dataKey="completedCount"
                stackId="a"
                fill="#22C55E"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="pendingCount"
                stackId="a"
                fill="#D1D5DB"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
