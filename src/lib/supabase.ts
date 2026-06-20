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

// ===== 认证相关 =====
export const auth = {
  // 邮箱注册
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  },

  // 邮箱登录
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  },

  // 退出登录
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // 获取当前用户
  getUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
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
};
