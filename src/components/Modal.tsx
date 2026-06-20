import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 通用模态框组件
 * - 固定定位，半透明黑色遮罩
 * - 白色圆角容器，最大宽度根据 size 设置
 * - 点击遮罩关闭
 * - Escape 键关闭
 * - 动画：fadeIn + slideUp
 */
export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // 尺寸映射
  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }[size];

  // Escape 键关闭
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
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        // 点击遮罩关闭
        if (e.target === overlayRef.current) {
          onClose();
        }
      }}
    >
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/50 animate-[fadeIn_150ms_ease]" />

      {/* 模态框容器 */}
      <div
        className={`relative ${sizeClass} w-full bg-white rounded-lg shadow-xl animate-[slideUp_200ms_ease]`}
      >
        {/* 标题栏 */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* 内容区 */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
