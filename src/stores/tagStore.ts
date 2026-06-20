import { create } from 'zustand';
import { db } from '../lib/supabase';
import type { Tag } from '../types';

interface TagState {
  tags: Tag[];
  isLoading: boolean;

  // 数据操作
  fetchTags: (userId: string) => Promise<void>;
  createTag: (tag: { name: string; color: string }, userId: string) => Promise<Tag | null>;
  updateTag: (id: string, updates: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
}

/**
 * 标签状态管理
 * 负责标签的 CRUD 操作
 */
export const useTagStore = create<TagState>((set) => ({
  tags: [],
  isLoading: false,

  // 从 Supabase 获取所有标签
  fetchTags: async (userId: string) => {
    set({ isLoading: true });
    const { data, error } = await db.tags.getAll(userId);
    if (error) {
      console.error('[TagStore] 获取标签失败:', error.message);
      set({ isLoading: false });
      return;
    }
    set({ tags: data || [], isLoading: false });
  },

  // 创建标签
  createTag: async (tag, userId) => {
    const now = new Date().toISOString();
    const row = {
      name: tag.name,
      color: tag.color,
      user_id: userId,
      created_at: now,
    };

    const { data, error } = await db.tags.create(row);
    if (error) {
      console.error('[TagStore] 创建标签失败:', error.message);
      return null;
    }

    if (data) {
      set((state) => ({ tags: [...state.tags, data] }));
    }
    return data;
  },

  // 更新标签
  updateTag: async (id, updates) => {
    const rowUpdates: Record<string, any> = {};
    if (updates.name !== undefined) rowUpdates.name = updates.name;
    if (updates.color !== undefined) rowUpdates.color = updates.color;

    const { data, error } = await db.tags.update(id, rowUpdates);
    if (error) {
      console.error('[TagStore] 更新标签失败:', error.message);
      return;
    }

    if (data) {
      set((state) => ({
        tags: state.tags.map((t) => (t.id === id ? data : t)),
      }));
    }
  },

  // 删除标签
  deleteTag: async (id) => {
    const { error } = await db.tags.delete(id);
    if (error) {
      console.error('[TagStore] 删除标签失败:', error.message);
      return;
    }
    set((state) => ({ tags: state.tags.filter((t) => t.id !== id) }));
  },
}));
