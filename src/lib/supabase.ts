import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 认证相关
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

// 数据库操作
export const db = {
  // 任务操作
  tasks: {
    getAll: async (userId: string) => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    create: async (task: any) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();
      return { data, error };
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

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
      return { data, error };
    },

    create: async (list: any) => {
      const { data, error } = await supabase
        .from('lists')
        .insert(list)
        .select()
        .single();
      return { data, error };
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('lists')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('lists')
        .delete()
        .eq('id', id);
      return { error };
    },
  },
};
