import { create } from 'zustand';
import { db } from '../lib/supabase';
import type { Task, Priority, SortBy, SortOrder } from '../types';

/** 过滤条件 */
export interface FilterOptions {
  listId?: string;
  priority?: Priority;
  completed?: boolean;
}

interface TaskState {
  tasks: Task[];
  isLoading: boolean;

  // 排序状态
  sortBy: SortBy;
  sortOrder: SortOrder;

  // 排序操作
  setSortBy: (sortBy: SortBy) => void;
  setSortOrder: (order: SortOrder) => void;

  // 数据操作
  fetchTasks: (userId: string) => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, userId: string) => Promise<Task | null>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;

  // 查询方法
  getTasksByList: (listId: string) => Task[];
  getTasksByDate: (date: string) => Task[];
  getTodayTasks: () => Task[];
  getWeekTasks: () => Task[];
  getSortedTasks: () => Task[];
  getFilteredTasks: (filter: FilterOptions) => Task[];
  searchTasks: (query: string) => Task[];
  getTasksByTag: (tagName: string) => Task[];
}

/** 优先级权重映射（用于排序） */
const priorityWeight: Record<Priority, number> = {
  high: 3,
  medium: 2,
  low: 1,
  none: 0,
};

/**
 * 任务状态管理
 * 负责任务的 CRUD 操作及各种查询过滤
 */
export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  sortBy: 'dueDate',
  sortOrder: 'asc',

  // 设置排序方式
  setSortBy: (sortBy) => set({ sortBy }),

  // 设置排序方向
  setSortOrder: (order) => set({ sortOrder: order }),

  // 从 Supabase 获取所有任务
  fetchTasks: async (userId: string) => {
    set({ isLoading: true });
    const { data, error } = await db.tasks.getAll(userId);
    if (error) {
      console.error('[TaskStore] 获取任务失败:', error.message);
      set({ isLoading: false });
      return;
    }
    set({ tasks: data || [], isLoading: false });
  },

  // 创建任务
  createTask: async (task, userId) => {
    const now = new Date().toISOString();
    const row = {
      title: task.title,
      description: task.description,
      completed: task.completed,
      priority: task.priority,
      due_date: task.dueDate || null,
      due_time: task.dueTime || null,
      repeat_rule: task.repeatRule,
      list_id: task.listId || null,  // 空字符串转为 null（UUID字段不能接受空字符串）
      tags: task.tags || [],
      user_id: userId,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await db.tasks.create(row);
    if (error) {
      console.error('[TaskStore] 创建任务失败:', error.message);
      return null;
    }

    if (data) {
      set((state) => ({ tasks: [data, ...state.tasks] }));
    }
    return data;
  },

  // 更新任务
  updateTask: async (id, updates) => {
    // 转换字段名为 snake_case
    const rowUpdates: Record<string, any> = {};
    if (updates.title !== undefined) rowUpdates.title = updates.title;
    if (updates.description !== undefined) rowUpdates.description = updates.description;
    if (updates.completed !== undefined) rowUpdates.completed = updates.completed;
    if (updates.priority !== undefined) rowUpdates.priority = updates.priority;
    if (updates.dueDate !== undefined) rowUpdates.due_date = updates.dueDate;
    if (updates.dueTime !== undefined) rowUpdates.due_time = updates.dueTime;
    if (updates.repeatRule !== undefined) rowUpdates.repeat_rule = updates.repeatRule;
    if (updates.listId !== undefined) rowUpdates.list_id = updates.listId;
    if (updates.tags !== undefined) rowUpdates.tags = updates.tags;

    const { data, error } = await db.tasks.update(id, rowUpdates);
    if (error) {
      console.error('[TaskStore] 更新任务失败:', error.message);
      return;
    }

    if (data) {
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? data : t)),
      }));
    }
  },

  // 删除任务
  deleteTask: async (id) => {
    const { error } = await db.tasks.delete(id);
    if (error) {
      console.error('[TaskStore] 删除任务失败:', error.message);
      return;
    }
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
  },

  // 切换任务完成状态
  toggleTask: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    const newCompleted = !task.completed;
    const updates: Partial<Task> = {
      completed: newCompleted,
      completedAt: newCompleted ? new Date().toISOString() : undefined,
    };

    await get().updateTask(id, updates);
  },

  // 按清单过滤
  getTasksByList: (listId) => {
    return get().tasks.filter((t) => t.listId === listId);
  },

  // 按日期过滤（匹配 dueDate）
  getTasksByDate: (date) => {
    return get().tasks.filter((t) => t.dueDate === date);
  },

  // 获取今天的任务
  getTodayTasks: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().tasks.filter((t) => t.dueDate === today);
  },

  // 获取最近 7 天的任务
  getWeekTasks: () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const startStr = weekStart.toISOString().split('T')[0];
    const endStr = weekEnd.toISOString().split('T')[0];

    return get().tasks.filter((t) => {
      if (!t.dueDate) return false;
      return t.dueDate >= startStr && t.dueDate <= endStr;
    });
  },

  // 根据当前排序设置返回排序后的任务
  getSortedTasks: () => {
    const { tasks, sortBy, sortOrder } = get();
    const sorted = [...tasks];

    sorted.sort((a, b) => {
      let compareResult = 0;

      switch (sortBy) {
        case 'priority': {
          compareResult = priorityWeight[a.priority] - priorityWeight[b.priority];
          break;
        }
        case 'dueDate': {
          // 无日期的排最后
          if (!a.dueDate && !b.dueDate) compareResult = 0;
          else if (!a.dueDate) compareResult = 1;
          else if (!b.dueDate) compareResult = -1;
          else compareResult = a.dueDate.localeCompare(b.dueDate);
          break;
        }
        case 'title': {
          compareResult = a.title.localeCompare(b.title, 'zh-CN');
          break;
        }
        case 'createdAt': {
          compareResult = a.createdAt.localeCompare(b.createdAt);
          break;
        }
      }

      return sortOrder === 'asc' ? compareResult : -compareResult;
    });

    return sorted;
  },

  // 根据过滤条件返回任务
  getFilteredTasks: (filter: FilterOptions) => {
    const { tasks } = get();
    return tasks.filter((task) => {
      if (filter.listId !== undefined && task.listId !== filter.listId) return false;
      if (filter.priority !== undefined && task.priority !== filter.priority) return false;
      if (filter.completed !== undefined && task.completed !== filter.completed) return false;
      return true;
    });
  },

  // 搜索任务（不区分大小写，搜索标题和描述）
  searchTasks: (query: string) => {
    if (!query.trim()) return [];
    const queryLower = query.toLowerCase();
    return get().tasks.filter((task) => {
      const titleMatch = task.title.toLowerCase().includes(queryLower);
      const descMatch = task.description?.toLowerCase().includes(queryLower) || false;
      return titleMatch || descMatch;
    });
  },

  // 按标签过滤任务
  getTasksByTag: (tagName: string) => {
    return get().tasks.filter((task) => task.tags.includes(tagName));
  },
}));
