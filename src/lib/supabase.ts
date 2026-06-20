import { createClient } from '@supabase/supabase-js';

// 检查环境变量
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] 缺少环境变量 VITE_SUPABASE_URL 或 VITE_SUPABASE_ANON_KEY，请检查 .env 文件'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// ===== 类型定义 =====
// Supabase 数据库行类型（snake_case）
interface TaskRow {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: string;
  due_date?: string;
  due_time?: string;
  repeat_rule: string;
  list_id: string;
  tags: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

interface ListRow {
  id: string;
  name: string;
  color: string;
  icon?: string;
  sort_order: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface FolderRow {
  id: string;
  name: string;
  color: string;
  sort_order: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface TagRow {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
}

interface PomodoroSessionRow {
  id: string;
  task_id?: string;
  duration_minutes: number;
  break_minutes: number;
  started_at: string;
  completed_at?: string;
  is_completed: boolean;
  notes?: string;
  user_id: string;
}

interface HabitRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: string;
  frequency_config?: any;
  reminder_time?: string;
  sort_order: number;
  is_archived: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface HabitLogRow {
  id: string;
  habit_id: string;
  log_date: string;
  completed: boolean;
  notes?: string;
  user_id: string;
  created_at: string;
}

interface CountdownRow {
  id: string;
  title: string;
  target_date: string;
  icon: string;
  color: string;
  is_pinned: boolean;
  sort_order: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// ===== 认证相关 =====
export const auth = {
  // 邮箱注册
  signUp: async (email: string, password: string) => {
    console.log('[Auth] 尝试注册:', email);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error('[Auth] 注册失败:', error.message, error.status);
    } else {
      console.log('[Auth] 注册成功:', data.user?.id);
    }
    return { data, error };
  },

  // 邮箱登录
  signIn: async (email: string, password: string) => {
    console.log('[Auth] 尝试登录:', email);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('[Auth] 登录失败:', error.message, error.status);
    } else {
      console.log('[Auth] 登录成功:', data.user?.id);
    }
    return { data, error };
  },

  // 退出登录
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // 获取当前用户
  getUser: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (err) {
      console.error('[Supabase] getUser 失败:', err);
      return null;
    }
  },

  // 监听认证状态变化
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// ===== 数据库操作（类型安全） =====

// 行类型转前端类型的辅助函数
const toTask = (row: TaskRow) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  completed: row.completed,
  priority: row.priority as any,
  dueDate: row.due_date,
  dueTime: row.due_time,
  repeatRule: row.repeat_rule as any,
  listId: row.list_id,
  tags: row.tags || [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  completedAt: row.completed_at,
});

const toList = (row: ListRow) => ({
  id: row.id,
  name: row.name,
  color: row.color,
  icon: row.icon,
  sortOrder: row.sort_order,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toFolder = (row: FolderRow) => ({
  id: row.id,
  name: row.name,
  color: row.color,
  sortOrder: row.sort_order,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toTag = (row: TagRow) => ({
  id: row.id,
  name: row.name,
  color: row.color,
});

const toPomodoroSession = (row: PomodoroSessionRow) => ({
  id: row.id,
  taskId: row.task_id,
  durationMinutes: row.duration_minutes,
  breakMinutes: row.break_minutes,
  startedAt: row.started_at,
  completedAt: row.completed_at,
  isCompleted: row.is_completed,
  notes: row.notes,
});

const toHabit = (row: HabitRow) => ({
  id: row.id,
  name: row.name,
  icon: row.icon,
  color: row.color,
  frequency: row.frequency as 'daily' | 'weekly' | 'custom',
  frequencyConfig: row.frequency_config,
  reminderTime: row.reminder_time,
  sortOrder: row.sort_order,
  isArchived: row.is_archived,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toHabitLog = (row: HabitLogRow) => ({
  id: row.id,
  habitId: row.habit_id,
  logDate: row.log_date,
  completed: row.completed,
  notes: row.notes,
  createdAt: row.created_at,
});

const toCountdown = (row: CountdownRow) => ({
  id: row.id,
  title: row.title,
  targetDate: row.target_date,
  icon: row.icon,
  color: row.color,
  isPinned: row.is_pinned,
  sortOrder: row.sort_order,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// 任务操作
export const db = {
  tasks: {
    // 获取所有任务
    getAll: async (userId: string) => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) return { data: null, error };
      return { data: data?.map(toTask) ?? [], error: null };
    },

    // 创建任务
    create: async (task: Omit<TaskRow, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();
      if (error) return { data: null, error };
      return { data: toTask(data as TaskRow), error: null };
    },

    // 更新任务
    update: async (id: string, updates: Partial<TaskRow>) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) return { data: null, error };
      return { data: toTask(data as TaskRow), error: null };
    },

    // 删除任务
    delete: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      return { error };
    },
  },

  // 清单操作
  lists: {
    getAll: async (userId: string) => {
      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true });
      if (error) return { data: null, error };
      return { data: data?.map(toList) ?? [], error: null };
    },

    create: async (list: Omit<ListRow, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('lists')
        .insert(list)
        .select()
        .single();
      if (error) return { data: null, error };
      return { data: toList(data as ListRow), error: null };
    },

    update: async (id: string, updates: Partial<ListRow>) => {
      const { data, error } = await supabase
        .from('lists')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) return { data: null, error };
      return { data: toList(data as ListRow), error: null };
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('lists')
        .delete()
        .eq('id', id);
      return { error };
    },
  },

  // 文件夹操作
  folders: {
    getAll: async (userId: string) => {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true });
      if (error) return { data: null, error };
      return { data: data?.map(toFolder) ?? [], error: null };
    },

    create: async (folder: Omit<FolderRow, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('folders')
        .insert(folder)
        .select()
        .single();
      if (error) return { data: null, error };
      return { data: toFolder(data as FolderRow), error: null };
    },
  },

  // 标签操作
  tags: {
    // 获取所有标签
    getAll: async (userId: string) => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });
      if (error) return { data: null, error };
      return { data: data?.map(toTag) ?? [], error: null };
    },

    // 创建标签
    create: async (tag: Omit<TagRow, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('tags')
        .insert(tag)
        .select()
        .single();
      if (error) return { data: null, error };
      return { data: toTag(data as TagRow), error: null };
    },

    // 更新标签
    update: async (id: string, updates: Partial<TagRow>) => {
      const { data, error } = await supabase
        .from('tags')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) return { data: null, error };
      return { data: toTag(data as TagRow), error: null };
    },

    // 删除标签
    delete: async (id: string) => {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);
      return { error };
    },
  },

  // 番茄钟操作
  pomodoro: {
    // 获取所有记录
    getAll: async (userId: string) => {
      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false });
      if (error) return { data: null, error };
      return { data: data?.map(toPomodoroSession) ?? [], error: null };
    },

    // 创建记录
    create: async (session: Omit<PomodoroSessionRow, 'id'>) => {
      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .insert(session)
        .select()
        .single();
      if (error) return { data: null, error };
      return { data: toPomodoroSession(data as PomodoroSessionRow), error: null };
    },

    // 更新记录
    update: async (id: string, updates: Partial<PomodoroSessionRow>) => {
      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) return { data: null, error };
      return { data: toPomodoroSession(data as PomodoroSessionRow), error: null };
    },
  },

  // 习惯操作
  habits: {
    // 获取所有习惯
    getAll: async (userId: string) => {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .eq('is_archived', false)
        .order('sort_order', { ascending: true });
      if (error) return { data: null, error };
      return { data: data?.map(toHabit) ?? [], error: null };
    },

    // 创建习惯
    create: async (habit: Omit<HabitRow, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('habits')
        .insert(habit)
        .select()
        .single();
      if (error) return { data: null, error };
      return { data: toHabit(data as HabitRow), error: null };
    },

    // 更新习惯
    update: async (id: string, updates: Partial<HabitRow>) => {
      const { data, error } = await supabase
        .from('habits')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) return { data: null, error };
      return { data: toHabit(data as HabitRow), error: null };
    },

    // 删除习惯
    delete: async (id: string) => {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);
      return { error };
    },
  },

  // 习惯打卡记录操作
  habitLogs: {
    // 获取打卡记录
    getAll: async (habitId: string, startDate: string, endDate: string) => {
      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('habit_id', habitId)
        .gte('log_date', startDate)
        .lte('log_date', endDate)
        .order('log_date', { ascending: true });
      if (error) return { data: null, error };
      return { data: data?.map(toHabitLog) ?? [], error: null };
    },

    // 打卡/取消打卡
    toggle: async (habitId: string, date: string, userId: string) => {
      // 先检查是否已有记录
      const { data: existing } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('habit_id', habitId)
        .eq('log_date', date)
        .single();

      if (existing) {
        // 如果已有记录，切换完成状态
        const newCompleted = !existing.completed;
        if (newCompleted) {
          // 重新打卡，更新记录
          const { data, error } = await supabase
            .from('habit_logs')
            .update({ completed: true })
            .eq('id', existing.id)
            .select()
            .single();
          if (error) return { data: null, error };
          return { data: toHabitLog(data as HabitLogRow), error: null };
        } else {
          // 取消打卡，删除记录
          const { error } = await supabase
            .from('habit_logs')
            .delete()
            .eq('id', existing.id);
          if (error) return { data: null, error };
          return { data: { ...existing, completed: false } as any, error: null };
        }
      } else {
        // 没有记录，创建新记录
        const { data, error } = await supabase
          .from('habit_logs')
          .insert({
            habit_id: habitId,
            log_date: date,
            completed: true,
            user_id: userId,
          })
          .select()
          .single();
        if (error) return { data: null, error };
        return { data: toHabitLog(data as HabitLogRow), error: null };
      }
    },
  },

  // 倒计时操作
  countdowns: {
    // 获取所有倒计时
    getAll: async (userId: string) => {
      const { data, error } = await supabase
        .from('countdowns')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true });
      if (error) return { data: null, error };
      return { data: data?.map(toCountdown) ?? [], error: null };
    },

    // 创建倒计时
    create: async (countdown: Omit<CountdownRow, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('countdowns')
        .insert(countdown)
        .select()
        .single();
      if (error) return { data: null, error };
      return { data: toCountdown(data as CountdownRow), error: null };
    },

    // 更新倒计时
    update: async (id: string, updates: Partial<CountdownRow>) => {
      const { data, error } = await supabase
        .from('countdowns')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) return { data: null, error };
      return { data: toCountdown(data as CountdownRow), error: null };
    },

    // 删除倒计时
    delete: async (id: string) => {
      const { error } = await supabase
        .from('countdowns')
        .delete()
        .eq('id', id);
      return { error };
    },
  },
};
