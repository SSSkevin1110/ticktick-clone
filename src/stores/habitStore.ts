import { create } from 'zustand';
import { db } from '../lib/supabase';
import type { Habit, HabitLog } from '../types';

interface HabitState {
  habits: Habit[];
  habitLogs: HabitLog[];
  isLoading: boolean;

  // 数据操作
  fetchHabits: (userId: string) => Promise<void>;
  createHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>, userId: string) => Promise<Habit | null>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;

  // 打卡记录操作
  fetchHabitLogs: (habitId: string, startDate: string, endDate: string) => Promise<void>;
  toggleHabitLog: (habitId: string, date: string) => Promise<void>;

  // 查询方法
  getStreak: (habitId: string) => number;
  getCompletionRate: (habitId: string, days: number) => number;
  getTodayLogs: () => HabitLog[];
  getLogsForDate: (date: string) => HabitLog[];
  getLogsForHabit: (habitId: string) => HabitLog[];
}

/**
 * 习惯状态管理
 * 负责习惯的 CRUD 操作、打卡记录管理及统计查询
 */
export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  habitLogs: [],
  isLoading: false,

  // 获取所有习惯
  fetchHabits: async (userId: string) => {
    set({ isLoading: true });
    const { data, error } = await db.habits.getAll(userId);
    if (error) {
      console.error('[HabitStore] 获取习惯失败:', error.message);
      set({ isLoading: false });
      return;
    }
    set({ habits: data || [], isLoading: false });
  },

  // 创建习惯
  createHabit: async (habit, userId) => {
    const row = {
      name: habit.name,
      icon: habit.icon,
      color: habit.color,
      frequency: habit.frequency,
      frequency_config: habit.frequencyConfig || null,
      reminder_time: habit.reminderTime || undefined,
      sort_order: habit.sortOrder,
      is_archived: habit.isArchived,
      user_id: userId,
    };

    const { data, error } = await db.habits.create(row);
    if (error) {
      console.error('[HabitStore] 创建习惯失败:', error.message);
      return null;
    }

    if (data) {
      set((state) => ({ habits: [data, ...state.habits] }));
    }
    return data;
  },

  // 更新习惯
  updateHabit: async (id, updates) => {
    const rowUpdates: Record<string, any> = {};
    if (updates.name !== undefined) rowUpdates.name = updates.name;
    if (updates.icon !== undefined) rowUpdates.icon = updates.icon;
    if (updates.color !== undefined) rowUpdates.color = updates.color;
    if (updates.frequency !== undefined) rowUpdates.frequency = updates.frequency;
    if (updates.frequencyConfig !== undefined) rowUpdates.frequency_config = updates.frequencyConfig;
    if (updates.reminderTime !== undefined) rowUpdates.reminder_time = updates.reminderTime;
    if (updates.sortOrder !== undefined) rowUpdates.sort_order = updates.sortOrder;
    if (updates.isArchived !== undefined) rowUpdates.is_archived = updates.isArchived;

    const { data, error } = await db.habits.update(id, rowUpdates);
    if (error) {
      console.error('[HabitStore] 更新习惯失败:', error.message);
      return;
    }

    if (data) {
      set((state) => ({
        habits: state.habits.map((h) => (h.id === id ? data : h)),
      }));
    }
  },

  // 删除习惯
  deleteHabit: async (id) => {
    const { error } = await db.habits.delete(id);
    if (error) {
      console.error('[HabitStore] 删除习惯失败:', error.message);
      return;
    }
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== id),
      habitLogs: state.habitLogs.filter((l) => l.habitId !== id),
    }));
  },

  // 获取打卡记录
  fetchHabitLogs: async (habitId, startDate, endDate) => {
    const { data, error } = await db.habitLogs.getAll(habitId, startDate, endDate);
    if (error) {
      console.error('[HabitStore] 获取打卡记录失败:', error.message);
      return;
    }
    // 合并记录，避免重复
    set((state) => {
      const existingIds = new Set(state.habitLogs.map((l) => l.id));
      const newLogs = (data || []).filter((l) => !existingIds.has(l.id));
      return { habitLogs: [...state.habitLogs, ...newLogs] };
    });
  },

  // 打卡/取消打卡
  toggleHabitLog: async (habitId, date) => {
    const { habitLogs } = get();
    const existingLog = habitLogs.find((l) => l.habitId === habitId && l.logDate === date);

    const { data, error } = await db.habitLogs.toggle(habitId, date, '');
    if (error) {
      console.error('[HabitStore] 打卡失败:', error.message);
      return;
    }

    if (data) {
      set((state) => {
        if (existingLog) {
          // 如果已有记录，更新或移除
          if (data.completed) {
            return {
              habitLogs: state.habitLogs.map((l) =>
                l.habitId === habitId && l.logDate === date ? data : l
              ),
            };
          } else {
            return {
              habitLogs: state.habitLogs.filter(
                (l) => !(l.habitId === habitId && l.logDate === date)
              ),
            };
          }
        } else {
          // 新增记录
          return { habitLogs: [...state.habitLogs, data] };
        }
      });
    }
  },

  // 获取连续打卡天数
  getStreak: (habitId) => {
    const { habitLogs } = get();
    const habitLogsFiltered = habitLogs
      .filter((l) => l.habitId === habitId && l.completed)
      .sort((a, b) => b.logDate.localeCompare(a.logDate));

    if (habitLogsFiltered.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 从今天开始往回数
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      const hasLog = habitLogsFiltered.some((l) => l.logDate === dateStr);
      if (hasLog) {
        streak++;
      } else {
        // 如果不是第一天就断了，说明连续中断
        if (i > 0) break;
      }
    }

    return streak;
  },

  // 获取完成率
  getCompletionRate: (habitId, days) => {
    const { habitLogs } = get();
    const habitLogsFiltered = habitLogs.filter(
      (l) => l.habitId === habitId && l.completed
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let completedDays = 0;
    for (let i = 0; i < days; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      if (habitLogsFiltered.some((l) => l.logDate === dateStr)) {
        completedDays++;
      }
    }

    return days > 0 ? Math.round((completedDays / days) * 100) : 0;
  },

  // 获取今天的打卡记录
  getTodayLogs: () => {
    const { habitLogs } = get();
    const today = new Date().toISOString().split('T')[0];
    return habitLogs.filter((l) => l.logDate === today);
  },

  // 获取某天的打卡记录
  getLogsForDate: (date) => {
    const { habitLogs } = get();
    return habitLogs.filter((l) => l.logDate === date);
  },

  // 获取某个习惯的所有打卡记录
  getLogsForHabit: (habitId) => {
    const { habitLogs } = get();
    return habitLogs.filter((l) => l.habitId === habitId);
  },
}));
