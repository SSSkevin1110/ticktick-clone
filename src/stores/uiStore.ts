import { create } from 'zustand';
import type { ViewType } from '../types';

interface UIState {
  sidebarOpen: boolean;
  currentView: ViewType;
  selectedTaskId: string | null;
  quickAddOpen: boolean;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentView: (view: ViewType) => void;
  selectTask: (id: string | null) => void;
  toggleQuickAdd: () => void;
  setQuickAddOpen: (open: boolean) => void;
}

/**
 * UI 状态管理
 * 控制侧边栏、视图切换、任务选中、快速添加等界面状态
 */
export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  currentView: 'today',
  selectedTaskId: null,
  quickAddOpen: false,

  // 切换侧边栏显示/隐藏
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // 直接设置侧边栏状态
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // 设置当前视图
  setCurrentView: (view) => set({ currentView: view }),

  // 选中/取消选中任务
  selectTask: (id) => set({ selectedTaskId: id }),

  // 切换快速添加面板
  toggleQuickAdd: () => set((state) => ({ quickAddOpen: !state.quickAddOpen })),

  // 直接设置快速添加面板状态
  setQuickAddOpen: (open) => set({ quickAddOpen: open }),
}));
