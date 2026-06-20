import { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, Flag, Tag, X } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import { useTaskStore } from '../stores/taskStore';
import { useAuthStore } from '../stores/authStore';
import { parseNaturalLanguage } from '../lib/nlp';
import { showToast } from './Toast';
import type { Priority } from '../types';

/**
 * 全局快速添加弹窗
 * - 全屏半透明遮罩 + 居中大输入框
 * - 自然语言输入提示
 * - 支持解析日期、优先级、标签
 * - Enter 提交，Escape 关闭
 * - 创建后显示 toast 通知
 */
export default function QuickAdd() {
  const { quickAddOpen, setQuickAddOpen } = useUIStore();
  const { createTask } = useTaskStore();
  const { user } = useAuthStore();
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<ReturnType<typeof parseNaturalLanguage> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 打开时聚焦输入框
  useEffect(() => {
    if (quickAddOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setInput('');
      setParsed(null);
    }
  }, [quickAddOpen]);

  // 实时解析输入
  useEffect(() => {
    if (input.trim()) {
      setParsed(parseNaturalLanguage(input));
    } else {
      setParsed(null);
    }
  }, [input]);

  // Escape 关闭
  useEffect(() => {
    if (!quickAddOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setQuickAddOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [quickAddOpen, setQuickAddOpen]);

  // 提交任务
  const handleSubmit = async () => {
    if (!input.trim() || !parsed || !user) return;

    const result = await createTask(
      {
        title: parsed.title,
        completed: false,
        priority: parsed.priority,
        dueDate: parsed.dueDate,
        dueTime: parsed.dueTime,
        repeatRule: 'none',
        listId: '',
        tags: parsed.tags,
      },
      user.id
    );

    if (result) {
      showToast('任务已创建', 'success');
      setQuickAddOpen(false);
    } else {
      showToast('创建失败，请重试', 'error');
    }
  };

  // 优先级显示文本
  const priorityLabel: Record<Priority, string> = {
    none: '无',
    low: '低',
    medium: '中',
    high: '高',
  };

  // 优先级颜色
  const priorityColor: Record<Priority, string> = {
    none: 'text-gray-400',
    low: 'text-blue-500',
    medium: 'text-yellow-500',
    high: 'text-red-500',
  };

  if (!quickAddOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setQuickAddOpen(false);
        }
      }}
    >
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/50 animate-[fadeIn_150ms_ease]" />

      {/* 输入容器 */}
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-xl animate-[slideUp_200ms_ease]">
        {/* 输入框 */}
        <div className="flex items-center gap-3 px-5 py-4">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                handleSubmit();
              }
            }}
            placeholder="输入任务... (支持自然语言，如: 明天下午3点开会 #工作 !高)"
            className="flex-1 text-base text-gray-900 placeholder-gray-400 outline-none"
          />
          <button
            onClick={() => setQuickAddOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 解析预览 */}
        {parsed && (
          <div className="px-5 pb-4 border-t border-gray-100 pt-3">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {/* 标题 */}
              <span className="text-gray-700 font-medium">{parsed.title}</span>

              {/* 日期 */}
              {parsed.dueDate && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                  <Calendar size={12} />
                  {parsed.dueDate}
                </span>
              )}

              {/* 时间 */}
              {parsed.dueTime && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                  <Clock size={12} />
                  {parsed.dueTime}
                </span>
              )}

              {/* 优先级 */}
              {parsed.priority !== 'none' && (
                <span className={`flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-md ${priorityColor[parsed.priority]}`}>
                  <Flag size={12} />
                  {priorityLabel[parsed.priority]}
                </span>
              )}

              {/* 标签 */}
              {parsed.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md"
                >
                  <Tag size={12} />
                  {tag}
                </span>
              ))}
            </div>

            {/* 提示 */}
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Enter 提交 / Escape 关闭 / 语法: !高 !!中 !!!低 #标签 明天 下午3点
              </p>
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="px-4 py-1.5 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                添加
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
