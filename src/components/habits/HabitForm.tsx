import { useState, useEffect } from 'react';
import Modal from '../Modal';
import type { Habit } from '../../types';

interface HabitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Habit | null;
}

/** 预设 emoji 图标 */
const presetEmojis = [
  '🏃', '💪', '📚', '🧘', '💧', '🎯', '✍️', '🎵',
  '💤', '🥗', '📝', '🌅', '🧹', '💰', '🧠', '🎨',
  '🚴', '🏊', '🥗', '💊', '🎸', '📸', '🌍', '🌱',
];

/** 预设颜色 */
const presetColors = [
  '#EF4444', // 红
  '#F97316', // 橙
  '#EAB308', // 黄
  '#22C55E', // 绿
  '#3B82F6', // 蓝
  '#8B5CF6', // 紫
  '#EC4899', // 粉
  '#6B7280', // 灰
];

/** 星期选项 */
const weekOptions = [
  { value: 0, label: '周日' },
  { value: 1, label: '周一' },
  { value: 2, label: '周二' },
  { value: 3, label: '周三' },
  { value: 4, label: '周四' },
  { value: 5, label: '周五' },
  { value: 6, label: '周六' },
];

/**
 * 习惯创建/编辑表单（模态框）
 * - 习惯名称输入
 * - 图标选择（emoji选择器，预设常用emoji）
 * - 颜色选择（8种预设颜色）
 * - 频率选择：每天/每周/自定义
 * - 自定义频率：选择星期几
 * - 提醒时间设置
 */
export default function HabitForm({ isOpen, onClose, onSubmit, initialData }: HabitFormProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [color, setColor] = useState('#3B82F6');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // 默认周一到周五
  const [reminderTime, setReminderTime] = useState('');

  // 编辑模式：填充初始数据
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setIcon(initialData.icon);
      setColor(initialData.color);
      setFrequency(initialData.frequency);
      if (initialData.frequencyConfig?.days) {
        setSelectedDays(initialData.frequencyConfig.days);
      }
      setReminderTime(initialData.reminderTime || '');
    } else {
      // 重置表单
      setName('');
      setIcon('🎯');
      setColor('#3B82F6');
      setFrequency('daily');
      setSelectedDays([1, 2, 3, 4, 5]);
      setReminderTime('');
    }
  }, [initialData, isOpen]);

  // 切换星期选择
  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  // 提交表单
  const handleSubmit = () => {
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      icon,
      color,
      frequency,
      frequencyConfig: frequency === 'custom' ? { days: selectedDays } : undefined,
      reminderTime: reminderTime || undefined,
      sortOrder: 0,
      isArchived: false,
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? '编辑习惯' : '新建习惯'} size="md">
      <div className="space-y-5">
        {/* 习惯名称 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">习惯名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：每天运动30分钟"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            autoFocus
          />
        </div>

        {/* 图标选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">选择图标</label>
          <div className="grid grid-cols-8 gap-2">
            {presetEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setIcon(emoji)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl transition-all ${
                  icon === emoji
                    ? 'bg-indigo-100 ring-2 ring-indigo-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* 颜色选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">选择颜色</label>
          <div className="flex items-center gap-2">
            {presetColors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition-all ${
                  color === c ? 'ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* 频率选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">打卡频率</label>
          <div className="flex gap-2">
            {[
              { value: 'daily' as const, label: '每天' },
              { value: 'weekly' as const, label: '每周' },
              { value: 'custom' as const, label: '自定义' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFrequency(opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  frequency === opt.value
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 自定义频率：选择星期几 */}
        {frequency === 'custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">选择星期</label>
            <div className="flex gap-2">
              {weekOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggleDay(opt.value)}
                  className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                    selectedDays.includes(opt.value)
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {opt.label.charAt(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 提醒时间 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">提醒时间（可选）</label>
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* 预览 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-xs text-gray-500 mb-2">预览</div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="font-medium text-gray-900">{name || '习惯名称'}</span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {initialData ? '保存' : '创建'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
