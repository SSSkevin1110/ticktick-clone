import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../stores/uiStore';

/**
 * 检查当前焦点是否在输入框/文本区域中
 * 在输入框中不应触发快捷键
 */
function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || (el as HTMLElement).isContentEditable;
}

/**
 * 键盘快捷键 Hook
 *
 * 全局快捷键:
 *   N — 快速添加任务（打开 QuickAdd）
 *   / — 聚焦搜索（打开 SearchModal）
 *   G then T — 跳转到今天
 *   G then W — 跳转到最近7天
 *   G then A — 跳转到全部任务
 *   G then C — 跳转到日历
 *   ? — 显示快捷键帮助
 *   Escape — 关闭弹窗
 */
export function useKeyboardShortcuts({
  onToggleSearch,
  onToggleHelp,
}: {
  onToggleSearch: () => void;
  onToggleHelp: () => void;
}) {
  const navigate = useNavigate();
  const { setQuickAddOpen, quickAddOpen, setCurrentView } = useUIStore();

  // 用于 G then X 组合键的状态
  const gPressedRef = useRef(false);
  const gTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // 在输入框中不触发快捷键
      if (isInputFocused()) return;

      // 如果有弹窗打开，Escape 关闭
      if (e.key === 'Escape') {
        if (quickAddOpen) {
          setQuickAddOpen(false);
          e.preventDefault();
        }
        return;
      }

      // 不处理组合键（Ctrl/Alt/Meta + 某键）
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      // G then X 组合键处理
      if (gPressedRef.current) {
        gPressedRef.current = false;
        if (gTimerRef.current) {
          clearTimeout(gTimerRef.current);
          gTimerRef.current = null;
        }

        switch (e.key.toLowerCase()) {
          case 't':
            // G then T — 跳转到今天
            e.preventDefault();
            setCurrentView('today');
            navigate('/today');
            break;
          case 'w':
            // G then W — 跳转到最近7天
            e.preventDefault();
            setCurrentView('week');
            navigate('/week');
            break;
          case 'a':
            // G then A — 跳转到全部任务
            e.preventDefault();
            setCurrentView('all');
            navigate('/');
            break;
          case 'c':
            // G then C — 跳转到日历
            e.preventDefault();
            setCurrentView('calendar');
            navigate('/calendar');
            break;
        }
        return;
      }

      // 检测 G 键，进入等待第二键状态
      if (e.key.toLowerCase() === 'g') {
        gPressedRef.current = true;
        gTimerRef.current = setTimeout(() => {
          gPressedRef.current = false;
          gTimerRef.current = null;
        }, 1000); // 1秒超时
        return;
      }

      // 单键快捷键
      switch (e.key.toLowerCase()) {
        case 'n':
          // N — 快速添加任务
          e.preventDefault();
          setQuickAddOpen(true);
          break;
        case '/':
          // / — 聚焦搜索
          e.preventDefault();
          onToggleSearch();
          break;
        case '?':
          // ? — 显示快捷键帮助
          e.preventDefault();
          onToggleHelp();
          break;
      }
    },
    [quickAddOpen, setQuickAddOpen, navigate, setCurrentView, onToggleSearch, onToggleHelp]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (gTimerRef.current) {
        clearTimeout(gTimerRef.current);
      }
    };
  }, [handleKeyDown]);
}
