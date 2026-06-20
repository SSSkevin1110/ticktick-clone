import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  primaryColor: string;
  setTheme: (theme: Theme) => void;
  setPrimaryColor: (color: string) => void;
  initialize: () => void;
}

// localStorage 键名
const THEME_KEY = 'ticktick-theme';
const PRIMARY_COLOR_KEY = 'ticktick-primary-color';

// 默认主色调
const DEFAULT_PRIMARY_COLOR = '#4F46E5';

/**
 * 根据系统主题偏好解析实际主题
 */
function getSystemTheme(): ResolvedTheme {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

/**
 * 根据 theme 设置解析实际应用的主题
 */
function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

/**
 * 将主题应用到 DOM
 */
function applyTheme(resolvedTheme: ResolvedTheme) {
  document.documentElement.setAttribute('data-theme', resolvedTheme);
}

/**
 * 将主色调应用到 CSS 变量
 */
function applyPrimaryColor(color: string) {
  document.documentElement.style.setProperty('--color-primary', color);
}

/**
 * 主题状态管理
 * - theme: 用户选择的主题（light/dark/system）
 * - resolvedTheme: 实际解析后的主题（light/dark）
 * - primaryColor: 主色调
 * - 监听系统主题变化，自动更新 resolvedTheme
 */
export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'system',
  resolvedTheme: 'light',
  primaryColor: DEFAULT_PRIMARY_COLOR,

  // 设置主题
  setTheme: (theme: Theme) => {
    const resolved = resolveTheme(theme);
    applyTheme(resolved);
    applyPrimaryColor(get().primaryColor);
    localStorage.setItem(THEME_KEY, theme);
    set({ theme, resolvedTheme: resolved });
  },

  // 设置主色调
  setPrimaryColor: (color: string) => {
    applyPrimaryColor(color);
    localStorage.setItem(PRIMARY_COLOR_KEY, color);
    set({ primaryColor: color });
  },

  // 初始化主题（从 localStorage 读取，监听系统变化）
  initialize: () => {
    // 从 localStorage 读取保存的主题偏好
    const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
    const savedColor = localStorage.getItem(PRIMARY_COLOR_KEY);

    const theme = savedTheme || 'system';
    const primaryColor = savedColor || DEFAULT_PRIMARY_COLOR;

    // 解析实际主题
    const resolved = resolveTheme(theme);

    // 应用到 DOM
    applyTheme(resolved);
    applyPrimaryColor(primaryColor);

    // 设置初始状态
    set({ theme, resolvedTheme: resolved, primaryColor });

    // 监听系统主题变化（仅在 system 模式下生效）
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const currentTheme = get().theme;
      if (currentTheme === 'system') {
        const newResolved = getSystemTheme();
        applyTheme(newResolved);
        set({ resolvedTheme: newResolved });
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    // 返回清理函数（虽然在 Layout 卸载时通常不需要）
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  },
}));
