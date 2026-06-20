import { create } from 'zustand';
import { db } from '../lib/supabase';
import type { Task } from '../types';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;

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
}

/**
 * 任务状态管理
 * 负责任务的 CRUD 操作及各种查询过滤
 */
export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,

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
      due_date: task.dueDate,
      due_time: task.dueTime,
      repeat_rule: task.repeatRule,
      list_id: task.listId,
      tags: task.tags,
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
}));
