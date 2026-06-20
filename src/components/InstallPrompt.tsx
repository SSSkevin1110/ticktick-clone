import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

/**
 * PWA 安装提示组件
 * - 监听 beforeinstallprompt 事件
 * - 显示安装横幅（底部弹出）
 * - 安装按钮 + 关闭按钮
 * - 安装后隐藏
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 检查是否已安装
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // 监听 beforeinstallprompt 事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // 延迟显示提示，避免干扰用户
      setTimeout(() => setShowPrompt(true), 3000);
    };

    // 监听应用安装完成事件
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // 处理安装
  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // 显示安装对话框
    (deferredPrompt as any).prompt();

    // 等待用户响应
    const { outcome } = await (deferredPrompt as any).userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  };

  // 关闭提示
  const handleDismiss = () => {
    setShowPrompt(false);
    // 24小时后再次显示
    try {
      localStorage.setItem('ticktick_install_dismissed', Date.now().toString());
    } catch {
      // 忽略 localStorage 错误
    }
  };

  // 检查是否在24小时内已关闭过
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('ticktick_install_dismissed');
      if (dismissed) {
        const dismissedTime = parseInt(dismissed, 10);
        const hoursSinceDismiss = (Date.now() - dismissedTime) / (1000 * 60 * 60);
        if (hoursSinceDismiss < 24) {
          setShowPrompt(false);
        }
      }
    } catch {
      // 忽略 localStorage 错误
    }
  }, []);

  // 不显示的情况
  if (isInstalled || !showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-40 animate-[slideUp_300ms_ease]">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          {/* 图标 */}
          <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Download size={20} className="text-indigo-600" />
          </div>

          {/* 内容 */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900">安装滴答清单</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              安装到桌面，随时快速访问
            </p>
          </div>

          {/* 关闭按钮 */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* 按钮 */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleInstall}
            className="flex-1 px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors"
          >
            安装
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            稍后
          </button>
        </div>
      </div>
    </div>
  );
}
