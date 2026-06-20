import { create } from 'zustand';
import { db } from '../lib/supabase';
import type { List, Folder } from '../types';

interface ListState {
  lists: List[];
  folders: Folder[];
  isLoading: boolean;

  fetchLists: (userId: string) => Promise<void>;
  createList: (list: Omit<List, 'id' | 'createdAt' | 'updatedAt'>, userId: string) => Promise<List | null>;
  updateList: (id: string, updates: Partial<List>) => Promise<void>;
  deleteList: (id: string) => Promise<void>;

  fetchFolders: (userId: string) => Promise<void>;
  createFolder: (folder: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>, userId: string) => Promise<Folder | null>;
}

/**
 * 清单与文件夹状态管理
 * 负责清单和文件夹的 CRUD 操作
 */
export const useListStore = create<ListState>((set) => ({
  lists: [],
  folders: [],
  isLoading: false,

  // 获取所有清单
  fetchLists: async (userId: string) => {
    set({ isLoading: true });
    const { data, error } = await db.lists.getAll(userId);
    if (error) {
      console.error('[ListStore] 获取清单失败:', error.message);
      set({ isLoading: false });
      return;
    }
    set({ lists: data || [], isLoading: false });
  },

  // 创建清单
  createList: async (list, userId) => {
    const now = new Date().toISOString();
    const row = {
      name: list.name,
      color: list.color,
      icon: list.icon,
      sort_order: list.sortOrder,
      user_id: userId,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await db.lists.create(row);
    if (error) {
      console.error('[ListStore] 创建清单失败:', error.message);
      return null;
    }

    if (data) {
      set((state) => ({ lists: [...state.lists, data] }));
    }
    return data;
  },

  // 更新清单
  updateList: async (id, updates) => {
    const rowUpdates: Record<string, any> = {};
    if (updates.name !== undefined) rowUpdates.name = updates.name;
    if (updates.color !== undefined) rowUpdates.color = updates.color;
    if (updates.icon !== undefined) rowUpdates.icon = updates.icon;
    if (updates.sortOrder !== undefined) rowUpdates.sort_order = updates.sortOrder;

    const { data, error } = await db.lists.update(id, rowUpdates);
    if (error) {
      console.error('[ListStore] 更新清单失败:', error.message);
      return;
    }

    if (data) {
      set((state) => ({
        lists: state.lists.map((l) => (l.id === id ? data : l)),
      }));
    }
  },

  // 删除清单
  deleteList: async (id) => {
    const { error } = await db.lists.delete(id);
    if (error) {
      console.error('[ListStore] 删除清单失败:', error.message);
      return;
    }
    set((state) => ({ lists: state.lists.filter((l) => l.id !== id) }));
  },

  // 获取所有文件夹
  fetchFolders: async (userId: string) => {
    const { data, error } = await db.folders.getAll(userId);
    if (error) {
      console.error('[ListStore] 获取文件夹失败:', error.message);
      return;
    }
    set({ folders: data || [] });
  },

  // 创建文件夹
  createFolder: async (folder, userId) => {
    const now = new Date().toISOString();
    const row = {
      name: folder.name,
      color: folder.color,
      sort_order: folder.sortOrder,
      user_id: userId,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await db.folders.create(row);
    if (error) {
      console.error('[ListStore] 创建文件夹失败:', error.message);
      return null;
    }

    if (data) {
      set((state) => ({ folders: [...state.folders, data] }));
    }
    return data;
  },
}));
