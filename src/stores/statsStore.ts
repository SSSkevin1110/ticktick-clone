import { create } from 'zustand';
import type { Task, Priority } from '../types';

/** 任务统计数据 */
export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  todayCompleted: number;
  weekCompleted: number;
}

/** 完成趋势数据 */
export interface TrendData {
  date: string;
  count: number;
}

/** 优先级分布数据 */
export interface PriorityData {
  priority: string;
  count: number;
}

/** 清单分布数据 */
export interface ListData {
  listId: string;
  listName: string;
  count: number;
  completedCount: number;
}

interface StatsState {
  // 计算方法
  getTaskStats: (tasks: Task[]) => TaskStats;
  getCompletionTrend: (tasks: Task[], days: number) => TrendData[];
  getPriorityDistribution: (tasks: Task[]) => PriorityData[];
  getListDistribution: (tasks: Task[]) => ListData[];
  getEfficiencyScore: (tasks: Task[]) => number;
  getAvgCompletionTime: (tasks: Task[]) => number;
}

/**
 * 统计状态管理
 * 提供各种统计计算方法，从任务数据实时计算
 */
export const useStatsStore = create<StatsState>(() => ({
  // 获取任务统计数据
  getTaskStats: (tasks: Task[]) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    // 计算本周起始日期（周日）
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;

    // 已过期：未完成且截止日期早于今天
    const overdue = tasks.filter(
      (t) => !t.completed && t.dueDate && t.dueDate < today
    ).length;

    // 今天完成的任务
    const todayCompleted = tasks.filter(
      (t) => t.completed && t.completedAt?.startsWith(today)
    ).length;

    // 本周完成的任务
    const weekCompleted = tasks.filter(
      (t) => t.completed && t.completedAt && t.completedAt >= weekStartStr
    ).length;

    return { total, completed, pending, overdue, todayCompleted, weekCompleted };
  },

  // 获取完成趋势（最近 N 天每天完成的任务数）
  getCompletionTrend: (tasks: Task[], days: number) => {
    const result: TrendData[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      // 统计该天完成的任务数
      const count = tasks.filter(
        (t) => t.completed && t.completedAt?.startsWith(dateStr)
      ).length;

      result.push({ date: dateStr, count });
    }

    return result;
  },

  // 获取优先级分布
  getPriorityDistribution: (tasks: Task[]) => {
    const priorityLabels: Record<Priority, string> = {
      high: '高优先级',
      medium: '中优先级',
      low: '低优先级',
      none: '无优先级',
    };

    const counts: Record<string, number> = {
      高优先级: 0,
      中优先级: 0,
      低优先级: 0,
      无优先级: 0,
    };

    tasks.forEach((t) => {
      const label = priorityLabels[t.priority];
      counts[label]++;
    });

    return Object.entries(counts).map(([priority, count]) => ({
      priority,
      count,
    }));
  },

  // 获取清单分布（每个清单的任务数和完成数）
  getListDistribution: (tasks: Task[]) => {
    const listMap = new Map<string, { count: number; completedCount: number }>();

    tasks.forEach((t) => {
      const existing = listMap.get(t.listId) || { count: 0, completedCount: 0 };
      existing.count++;
      if (t.completed) existing.completedCount++;
      listMap.set(t.listId, existing);
    });

    // 从 tasks 中提取 listId 到 listName 的映射
    // 注意：这里 listId 可能是 'default' 或者实际的清单 ID
    const result: ListData[] = [];
    listMap.forEach((value, key) => {
      result.push({
        listId: key,
        listName: key === 'default' ? '默认清单' : key,
        count: value.count,
        completedCount: value.completedCount,
      });
    });

    // 按任务数降序排列
    result.sort((a, b) => b.count - a.count);

    return result;
  },

  // 获取效率分数（0-100）
  // 计算方法：完成率 * 40 + 今日完成数权重 * 30 + 按时完成率 * 30
  getEfficiencyScore: (tasks: Task[]) => {
    if (tasks.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const stats = {
      total: tasks.length,
      completed: tasks.filter((t) => t.completed).length,
      todayCompleted: tasks.filter(
        (t) => t.completed && t.completedAt?.startsWith(today)
      ).length,
      onTimeCompleted: tasks.filter(
        (t) =>
          t.completed &&
          t.dueDate &&
          t.completedAt &&
          t.completedAt.split('T')[0] <= t.dueDate
      ).length,
      completedWithDueDate: tasks.filter(
        (t) => t.completed && t.dueDate
      ).length,
    };

    // 完成率（0-40）
    const completionRate = (stats.completed / stats.total) * 40;

    // 今日活跃度（0-30），每天完成 5 个以上得满分
    const todayScore = Math.min(stats.todayCompleted / 5, 1) * 30;

    // 按时完成率（0-30）
    const onTimeRate =
      stats.completedWithDueDate > 0
        ? (stats.onTimeCompleted / stats.completedWithDueDate) * 30
        : 15; // 没有截止日期的任务给 15 分

    const score = Math.round(completionRate + todayScore + onTimeRate);
    return Math.min(Math.max(score, 0), 100);
  },

  // 获取平均完成时间（小时）
  // 计算：从创建到完成的平均时间
  getAvgCompletionTime: (tasks: Task[]) => {
    const completedTasks = tasks.filter(
      (t) => t.completed && t.completedAt && t.createdAt
    );

    if (completedTasks.length === 0) return 0;

    const totalHours = completedTasks.reduce((sum, t) => {
      const created = new Date(t.createdAt).getTime();
      const completed = new Date(t.completedAt!).getTime();
      const hours = (completed - created) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);

    return Math.round((totalHours / completedTasks.length) * 10) / 10;
  },
}));
