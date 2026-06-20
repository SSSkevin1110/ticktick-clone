import { useEffect, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

let toastId = 0;
let addToastFn: ((message: string, type: ToastType) => void) | null = null;

/**
 * 全局 toast 函数，可在任何地方调用
 */
export function showToast(message: string, type: ToastType = 'info') {
  if (addToastFn) {
    addToastFn(message, type);
  }
}

/**
 * Toast 通知组件
 * - 右下角固定定位
 * - 支持 success/error/info 类型
 * - 自动消失（3秒）
 * - 支持手动关闭
 * - 动画：slideInRight + fadeOut
 */
export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = `toast-${++toastId}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    // 3秒后自动消失
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // 注册全局函数
  useEffect(() => {
    addToastFn = addToast;
    return () => {
      addToastFn = null;
    };
  }, [addToast]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 图标映射
  const iconMap = {
    success: <CheckCircle size={18} className="text-green-500" />,
    error: <AlertCircle size={18} className="text-red-500" />,
    info: <Info size={18} className="text-blue-500" />,
  };

  // 背景色映射
  const bgMap = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  return (
    <div className="fixed bottom-20 right-4 z-[100] flex flex-col gap-2 lg:bottom-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-md animate-[slideInRight_200ms_ease] ${bgMap[toast.type]}`}
        >
          {iconMap[toast.type]}
          <span className="text-sm text-gray-800 flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
