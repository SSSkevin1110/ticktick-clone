import { create } from 'zustand';
import { auth } from '../lib/supabase';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  initialize: () => void;
}

/**
 * 认证状态管理
 * 监听 Supabase auth 状态变化，自动同步用户信息
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  // 邮箱注册
  signUp: async (email: string, password: string) => {
    const { data, error } = await auth.signUp(email, password);
    if (error) {
      return { error: error.message };
    }
    // 注册成功后 Supabase 可能自动登录，也可能需要邮件确认
    if (data.user) {
      set({
        user: {
          id: data.user.id,
          email: data.user.email || '',
          displayName: data.user.user_metadata?.display_name || data.user.email || '',
          avatarUrl: data.user.user_metadata?.avatar_url,
        },
        isAuthenticated: true,
      });
    }
    return {};
  },

  // 邮箱登录
  signIn: async (email: string, password: string) => {
    const { data, error } = await auth.signIn(email, password);
    if (error) {
      return { error: error.message };
    }
    if (data.user) {
      set({
        user: {
          id: data.user.id,
          email: data.user.email || '',
          displayName: data.user.user_metadata?.display_name || data.user.email || '',
          avatarUrl: data.user.user_metadata?.avatar_url,
        },
        isAuthenticated: true,
      });
    }
    return {};
  },

  // 退出登录
  signOut: async () => {
    await auth.signOut();
    set({ user: null, isAuthenticated: false });
  },

  // 初始化：监听 Supabase auth 状态变化
  initialize: () => {
    // 先检查当前是否有活跃会话
    auth.getUser().then((supabaseUser) => {
      if (supabaseUser) {
        set({
          user: {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            displayName: supabaseUser.user_metadata?.display_name || supabaseUser.email || '',
            avatarUrl: supabaseUser.user_metadata?.avatar_url,
          },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    });

    // 监听后续的认证状态变化
    auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        set({
          user: {
            id: session.user.id,
            email: session.user.email || '',
            displayName: session.user.user_metadata?.display_name || session.user.email || '',
            avatarUrl: session.user.user_metadata?.avatar_url,
          },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    });
  },
}));
