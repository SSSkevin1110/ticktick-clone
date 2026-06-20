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
      // 提供更友好的错误信息
      let msg = error.message;
      if (error.message.includes('already registered')) {
        msg = '该邮箱已注册，请直接登录';
      } else if (error.message.includes('valid email')) {
        msg = '请输入有效的邮箱地址';
      } else if (error.message.includes('password')) {
        msg = '密码至少需要6个字符';
      }
      return { error: msg };
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
        isLoading: false,
      });
    }
    return {};
  },

  // 邮箱登录
  signIn: async (email: string, password: string) => {
    const { data, error } = await auth.signIn(email, password);
    if (error) {
      // 提供更友好的错误信息
      let msg = error.message;
      if (error.message.includes('Invalid login credentials')) {
        msg = '邮箱或密码错误，请重试';
      } else if (error.message.includes('Email not confirmed')) {
        msg = '邮箱未验证，请先验证邮箱';
      }
      return { error: msg };
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
        isLoading: false,
      });
    }
    return {};
  },

  // 退出登录
  signOut: async () => {
    await auth.signOut();
    set({ user: null, isAuthenticated: false });
  },

  // 初始化：检查当前会话 + 监听状态变化
  initialize: async () => {
    // 超时保护：3秒后无论如何结束加载状态
    const timeout = setTimeout(() => {
      console.warn('[Auth] 初始化超时，跳过加载状态');
      set({ isLoading: false });
    }, 3000);

    try {
      // 检查当前是否有活跃会话
      const supabaseUser = await auth.getUser();
      clearTimeout(timeout);

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
    } catch (err) {
      clearTimeout(timeout);
      console.error('[Auth] 初始化失败:', err);
      set({ isLoading: false });
    }

    // 监听后续的认证状态变化
    try {
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
    } catch (err) {
      console.error('[Auth] 监听状态变化失败:', err);
    }
  },
}));
