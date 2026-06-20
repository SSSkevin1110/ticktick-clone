import { useState, useEffect } from 'react';
import Modal from '../Modal';
import type { Countdown } from '../../types';

interface CountdownFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Countdown, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Countdown | null;
}

/** 预设 emoji 图标 */
const presetEmojis = [
  '⏰', '🎯', '🎉', '🎂', '📅', '🏫', '💼', '✈️',
  '🏠', '💍', '🎓', '🌍', '🏖️', '🎄', '🌸', '⚽',
  '🎵', '📚', '💰', '🏋️', '🎬', '🚗', '🐱', '👶',
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

/**
 * 倒计时创建/编辑表单（模态框）
 * - 标题输入
 * - 目标日期选择
 * - 图标选择（emoji）
 * - 颜色选择（预设颜色）
 */
export default function CountdownForm({ isOpen, onClose, onSubmit, initialData }: CountdownFormProps) {
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [icon, setIcon] = useState('⏰');
  const [color, setColor] = useState('#3B82F6');

  // 编辑模式：填充初始数据
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setTargetDate(initialData.targetDate);
      setIcon(initialData.icon);
      setColor(initialData.color);
    } else {
      // 重置表单
      setTitle('');
      // 默认目标日期为明天
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setTargetDate(tomorrow.toISOString().split('T')[0]);
      setIcon('⏰');
      setColor('#3B82F6');
    }
  }, [initialData, isOpen]);

  // 提交表单
  const handleSubmit = () => {
    if (!title.trim() || !targetDate) return;

    onSubmit({
      title: title.trim(),
      targetDate,
      icon,
      color,
      isPinned: initialData?.isPinned ?? false,
      sortOrder: initialData?.sortOrder ?? 0,
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? '编辑倒计时' : '新建倒计时'} size="md">
      <div className="space-y-5">
        {/* 标题输入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">倒计时标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：高考、生日、旅行"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            autoFocus
          />
        </div>

        {/* 目标日期 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">目标日期</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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

        {/* 预览 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-xs text-gray-500 mb-2">预览</div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="font-medium text-gray-900">{title || '倒计时标题'}</span>
            <span className="text-sm text-gray-500">
              {targetDate ? new Date(targetDate).toLocaleDateString('zh-CN') : '选择日期'}
            </span>
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
            disabled={!title.trim() || !targetDate}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {initialData ? '保存' : '创建'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
