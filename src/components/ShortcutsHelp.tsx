import { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

/** 快捷键定义 */
const shortcuts = [
  {
    category: '全局',
    items: [
      { keys: ['N'], description: '快速添加任务' },
      { keys: ['/'], description: '聚焦搜索' },
      { keys: ['?'], description: '显示快捷键帮助' },
      { keys: ['Esc'], description: '关闭弹窗/面板' },
    ],
  },
  {
    category: '导航',
    items: [
      { keys: ['G', 'T'], description: '跳转到今天' },
      { keys: ['G', 'W'], description: '跳转到最近7天' },
      { keys: ['G', 'A'], description: '跳转到全部任务' },
      { keys: ['G', 'C'], description: '跳转到日历' },
    ],
  },
  {
    category: '任务操作',
    items: [
      { keys: ['Enter'], description: '提交/确认' },
      { keys: ['Esc'], description: '取消/关闭' },
    ],
  },
];

/**
 * 快捷键帮助弹窗
 * - 显示所有可用快捷键
 * - 按分类组织：全局、导航、任务操作
 * - 每个快捷键显示按键 + 说明
 * - Escape 关闭
 */
export default function ShortcutsHelp({ isOpen, onClose }: ShortcutsHelpProps) {
  // Escape 关闭
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 打开时锁定 body 滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/50 animate-[fadeIn_150ms_ease]" />

      {/* 弹窗内容 */}
      <div
        className="relative w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl animate-[slideUp_200ms_ease] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Keyboard size={20} className="text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900">键盘快捷键</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 快捷键列表 */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {shortcuts.map((group) => (
            <div key={group.category} className="mb-5 last:mb-0">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                {group.category}
              </h3>
              <div className="space-y-2">
                {group.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm text-gray-700">{item.description}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center gap-1">
                          {keyIndex > 0 && (
                            <span className="text-xs text-gray-400 mx-0.5">+</span>
                          )}
                          <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-gray-100 border border-gray-200 rounded-md text-xs font-mono text-gray-700 shadow-sm">
                            {key}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 底部提示 */}
        <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400 text-center">
          按 <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">?</kbd> 随时打开此面板
        </div>
      </div>
    </div>
  );
}
