import { create } from 'zustand';
import { db } from '../lib/supabase';
import type { Countdown } from '../types';

interface CountdownState {
  countdowns: Countdown[];
  isLoading: boolean;

  // 数据操作
  fetchCountdowns: (userId: string) => Promise<void>;
  createCountdown: (countdown: Omit<Countdown, 'id' | 'createdAt' | 'updatedAt'>, userId: string) => Promise<Countdown | null>;
  updateCountdown: (id: string, updates: Partial<Countdown>) => Promise<void>;
  deleteCountdown: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;

  // 查询方法
  getPinnedCountdowns: () => Countdown[];
  getUnpinnedCountdowns: () => Countdown[];
}

/**
 * 倒计时状态管理
 * 负责倒计时的 CRUD 操作及置顶管理
 */
export const useCountdownStore = create<CountdownState>((set, get) => ({
  countdowns: [],
  isLoading: false,

  // 获取所有倒计时
  fetchCountdowns: async (userId: string) => {
    set({ isLoading: true });
    const { data, error } = await db.countdowns.getAll(userId);
    if (error) {
      console.error('[CountdownStore] 获取倒计时失败:', error.message);
      set({ isLoading: false });
      return;
    }
    set({ countdowns: data || [], isLoading: false });
  },

  // 创建倒计时
  createCountdown: async (countdown, userId) => {
    const row = {
      title: countdown.title,
      target_date: countdown.targetDate,
      icon: countdown.icon,
      color: countdown.color,
      is_pinned: countdown.isPinned,
      sort_order: countdown.sortOrder,
      user_id: userId,
    };

    const { data, error } = await db.countdowns.create(row);
    if (error) {
      console.error('[CountdownStore] 创建倒计时失败:', error.message);
      return null;
    }

    if (data) {
      set((state) => ({ countdowns: [data, ...state.countdowns] }));
    }
    return data;
  },

  // 更新倒计时
  updateCountdown: async (id, updates) => {
    const rowUpdates: Record<string, any> = {};
    if (updates.title !== undefined) rowUpdates.title = updates.title;
    if (updates.targetDate !== undefined) rowUpdates.target_date = updates.targetDate;
    if (updates.icon !== undefined) rowUpdates.icon = updates.icon;
    if (updates.color !== undefined) rowUpdates.color = updates.color;
    if (updates.isPinned !== undefined) rowUpdates.is_pinned = updates.isPinned;
    if (updates.sortOrder !== undefined) rowUpdates.sort_order = updates.sortOrder;

    const { data, error } = await db.countdowns.update(id, rowUpdates);
    if (error) {
      console.error('[CountdownStore] 更新倒计时失败:', error.message);
      return;
    }

    if (data) {
      set((state) => ({
        countdowns: state.countdowns.map((c) => (c.id === id ? data : c)),
      }));
    }
  },

  // 删除倒计时
  deleteCountdown: async (id) => {
    const { error } = await db.countdowns.delete(id);
    if (error) {
      console.error('[CountdownStore] 删除倒计时失败:', error.message);
      return;
    }
    set((state) => ({
      countdowns: state.countdowns.filter((c) => c.id !== id),
    }));
  },

  // 切换置顶状态
  togglePin: async (id) => {
    const countdown = get().countdowns.find((c) => c.id === id);
    if (!countdown) return;
    await get().updateCountdown(id, { isPinned: !countdown.isPinned });
  },

  // 获取置顶的倒计时
  getPinnedCountdowns: () => {
    return get().countdowns.filter((c) => c.isPinned);
  },

  // 获取未置顶的倒计时
  getUnpinnedCountdowns: () => {
    return get().countdowns.filter((c) => !c.isPinned);
  },
}));
