import { useState, useMemo } from 'react';
import {
  ListChecks,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Timer,
  Zap,
} from 'lucide-react';
import { useTaskStore } from '../stores/taskStore';
import { useStatsStore } from '../stores/statsStore';
import StatCard from '../components/stats/StatCard';
import CompletionChart from '../components/stats/CompletionChart';
import PriorityPieChart from '../components/stats/PriorityPieChart';
import ListBarChart from '../components/stats/ListBarChart';

/**
 * 统计报表页面
 * 展示任务统计概览、完成趋势、优先级分布、清单分布
 */
export default function Statistics() {
  const { tasks } = useTaskStore();
  const {
    getTaskStats,
    getCompletionTrend,
    getPriorityDistribution,
    getListDistribution,
    getEfficiencyScore,
    getAvgCompletionTime,
  } = useStatsStore();

  // 时间范围状态
  const [trendRange, setTrendRange] = useState(7);

  // 计算统计数据
  const stats = useMemo(() => getTaskStats(tasks), [tasks, getTaskStats]);
  const trendData = useMemo(
    () => getCompletionTrend(tasks, trendRange),
    [tasks, trendRange, getCompletionTrend]
  );
  const priorityData = useMemo(
    () => getPriorityDistribution(tasks),
    [tasks, getPriorityDistribution]
  );
  const listData = useMemo(
    () => getListDistribution(tasks),
    [tasks, getListDistribution]
  );
  const efficiencyScore = useMemo(
    () => getEfficiencyScore(tasks),
    [tasks, getEfficiencyScore]
  );
  const avgCompletionTime = useMemo(
    () => getAvgCompletionTime(tasks),
    [tasks, getAvgCompletionTime]
  );

  return (
    <div className="w-full px-6 py-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">统计报表</h1>
        <p className="text-sm text-gray-500 mt-1">查看你的任务完成情况和效率分析</p>
      </div>

      {/* 统计卡片 - 4 个 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<ListChecks size={24} />}
          title="总任务"
          value={stats.total}
          color="indigo"
        />
        <StatCard
          icon={<CheckCircle2 size={24} />}
          title="已完成"
          value={stats.completed}
          color="green"
        />
        <StatCard
          icon={<Clock size={24} />}
          title="待完成"
          value={stats.pending}
          color="yellow"
        />
        <StatCard
          icon={<AlertTriangle size={24} />}
          title="已过期"
          value={stats.overdue}
          color="red"
        />
      </div>

      {/* 额外统计卡片 - 效率分数和平均完成时间 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard
          icon={<Zap size={24} />}
          title="效率分数"
          value={`${efficiencyScore}分`}
          color="indigo"
        />
        <StatCard
          icon={<Timer size={24} />}
          title="平均完成时间"
          value={avgCompletionTime > 0 ? `${avgCompletionTime}小时` : '暂无数据'}
          color="green"
        />
      </div>

      {/* 完成趋势图表 */}
      <div className="mb-6">
        <CompletionChart
          data={trendData}
          currentRange={trendRange}
          onRangeChange={setTrendRange}
        />
      </div>

      {/* 底部：优先级分布 + 清单分布 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriorityPieChart data={priorityData} total={stats.total} />
        <ListBarChart data={listData} />
      </div>
    </div>
  );
}
