import { Check } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';

/**
 * 预设主色调配置
 */
const presetColors = [
  { name: 'Indigo', color: '#4F46E5' },
  { name: 'Blue', color: '#3B82F6' },
  { name: 'Cyan', color: '#06B6D4' },
  { name: 'Teal', color: '#14B8A6' },
  { name: 'Green', color: '#10B981' },
  { name: 'Yellow', color: '#EAB308' },
  { name: 'Orange', color: '#F97316' },
  { name: 'Red', color: '#EF4444' },
  { name: 'Pink', color: '#EC4899' },
  { name: 'Purple', color: '#8B5CF6' },
];

/**
 * 主色调选择器
 * 预设10种主题色，圆形按钮显示
 * 当前选中项有对勾标记
 */
export default function ColorPicker() {
  const { primaryColor, setPrimaryColor } = useThemeStore();

  return (
    <div className="flex flex-wrap gap-3">
      {presetColors.map((preset) => {
        const isActive = primaryColor === preset.color;

        return (
          <button
            key={preset.color}
            onClick={() => setPrimaryColor(preset.color)}
            title={preset.name}
            className={`relative w-10 h-10 rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isActive
                ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                : 'hover:ring-2 hover:ring-offset-2 hover:ring-gray-300'
            }`}
            style={{
              backgroundColor: preset.color,
              '--tw-ring-color': preset.color,
            } as React.CSSProperties}
          >
            {isActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check size={18} className="text-white drop-shadow-sm" strokeWidth={3} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
