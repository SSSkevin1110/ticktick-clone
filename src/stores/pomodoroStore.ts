import { create } from 'zustand';
import { db } from '../lib/supabase';
import type { PomodoroSession } from '../types';

/** 番茄钟设置 */
interface PomodoroSettings {
  workDuration: number; // 工作时长（秒）
  shortBreak: number; // 短休息时长（秒）
  longBreak: number; // 长休息时长（秒）
  sessionsBeforeLongBreak: number; // 几个番茄后长休息
}

/** 番茄钟状态 */
interface PomodoroState {
  // 状态
  sessions: PomodoroSession[];
  isRunning: boolean;
  isBreak: boolean;
  timeLeft: number;
  currentTaskId: string | null;
  currentSessionId: string | null; // 当前番茄钟会话ID
  completedSessions: number; // 当前循环中已完成的番茄数
  isLoading: boolean;
  settings: PomodoroSettings;

  // 操作
  startPomodoro: (taskId?: string) => void;
  pausePomodoro: () => void;
  resumePomodoro: () => void;
  stopPomodoro: () => void;
  skipBreak: () => void;
  tick: () => void;
  setCurrentTaskId: (taskId: string | null) => void;
  fetchSessions: (userId: string) => Promise<void>;

  // 查询方法
  getTodayStats: () => { completedCount: number; totalMinutes: number };
  getWeekStats: () => { date: string; count: number }[];
  setCurrentSessionId: (id: string) => void;
}

/** 默认番茄钟设置 */
const defaultSettings: PomodoroSettings = {
  workDuration: 25 * 60, // 25分钟
  shortBreak: 5 * 60, // 5分钟
  longBreak: 15 * 60, // 15分钟
  sessionsBeforeLongBreak: 4, // 4个番茄后长休息
};

/**
 * 番茄钟状态管理
 * 管理番茄钟的计时、状态切换、历史记录
 */
export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  sessions: [],
  isRunning: false,
  isBreak: false,
  timeLeft: defaultSettings.workDuration,
  currentTaskId: null,
  completedSessions: 0,
  isLoading: false,
  settings: defaultSettings,
  currentSessionId: null,

  // 开始番茄钟
  startPomodoro: (taskId?: string) => {
    const { settings } = get();
    set({
      isRunning: true,
      isBreak: false,
      timeLeft: settings.workDuration,
      currentTaskId: taskId || null,
    });
  },

  // 暂停番茄钟
  pausePomodoro: () => {
    set({ isRunning: false });
  },

  // 继续番茄钟
  resumePomodoro: () => {
    set({ isRunning: true });
  },

  // 停止番茄钟
  stopPomodoro: () => {
    const { settings } = get();
    // 如果当前是工作状态且已运行了一段时间，记录一个未完成的会话
    set({
      isRunning: false,
      isBreak: false,
      timeLeft: settings.workDuration,
      completedSessions: 0,
    });
  },

  // 跳过休息
  skipBreak: () => {
    const { settings } = get();
    set({
      isBreak: false,
      isRunning: false,
      timeLeft: settings.workDuration,
      completedSessions: 0,
    });
  },

  // 每秒滴答
  tick: () => {
    const { isRunning, timeLeft, isBreak, completedSessions, settings, currentTaskId } = get();
    if (!isRunning) return;

    if (timeLeft <= 1) {
      // 时间到了
      if (!isBreak) {
        // 工作结束，开始休息
        const newCompleted = completedSessions + 1;
        const isLongBreak = newCompleted % settings.sessionsBeforeLongBreak === 0;
        const breakDuration = isLongBreak ? settings.longBreak : settings.shortBreak;

        set({
          timeLeft: breakDuration,
          isBreak: true,
          isRunning: true,
          completedSessions: newCompleted,
          currentTaskId: currentTaskId, // 保持任务关联
        });
      } else {
        // 休息结束
        set({
          isBreak: false,
          isRunning: false,
          timeLeft: settings.workDuration,
          currentTaskId: currentTaskId, // 保持任务关联
        });
      }
    } else {
      set({ timeLeft: timeLeft - 1 });
    }
  },

  // 设置当前关联任务
  setCurrentTaskId: (taskId: string | null) => {
    set({ currentTaskId: taskId });
  },

  // 设置当前会话ID
  setCurrentSessionId: (id: string) => {
    set({ currentSessionId: id });
  },

  // 获取历史记录
  fetchSessions: async (userId: string) => {
    set({ isLoading: true });
    const { data, error } = await db.pomodoro.getAll(userId);
    if (error) {
      console.error('[PomodoroStore] 获取记录失败:', error.message);
      set({ isLoading: false });
      return;
    }
    set({ sessions: data || [], isLoading: false });
  },

  // 获取今日统计
  getTodayStats: () => {
    const { sessions } = get();
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter(
      (s) => s.completedAt?.startsWith(today) && s.isCompleted
    );
    return {
      completedCount: todaySessions.length,
      totalMinutes: todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0),
    };
  },

  // 获取本周统计（每天的番茄数）
  getWeekStats: () => {
    const { sessions } = get();
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const result: { date: string; count: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const count = sessions.filter(
        (s) => s.completedAt?.startsWith(dateStr) && s.isCompleted
      ).length;
      result.push({ date: dateStr, count });
    }
    return result;
  },
}));
