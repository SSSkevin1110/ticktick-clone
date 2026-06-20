import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import type { Theme } from '../stores/themeStore';

/**
 * 主题切换选项配置
 */
const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: '亮色', icon: Sun },
  { value: 'dark', label: '暗色', icon: Moon },
  { value: 'system', label: '跟随系统', icon: Monitor },
];

/**
 * 主题切换组件
 * 三个按钮：亮色/暗色/跟随系统
 * 当前选中项高亮
 */
export default function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="flex gap-2">
      {themeOptions.map((option) => {
        const isActive = theme === option.value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-indigo-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <Icon size={16} />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
