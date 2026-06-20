// 任务优先级
export type Priority = 'none' | 'low' | 'medium' | 'high';

// 重复规则
export type RepeatRule = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

// 任务
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string; // ISO日期字符串
  dueTime?: string; // HH:mm格式
  repeatRule: RepeatRule;
  listId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// 清单
export interface List {
  id: string;
  name: string;
  color: string;
  icon?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// 标签
export interface Tag {
  id: string;
  name: string;
  color: string;
}

// 文件夹
export interface Folder {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// 视图类型
export type ViewType = 'all' | 'today' | 'week' | 'calendar' | 'list';

// 排序方式
export type SortBy = 'dueDate' | 'priority' | 'title' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

// 用户
export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

// 习惯
export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'custom';
  frequencyConfig?: any;
  reminderTime?: string;
  sortOrder: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  logDate: string;
  completed: boolean;
  notes?: string;
  createdAt: string;
}

// 番茄钟
export interface PomodoroSession {
  id: string;
  taskId?: string;
  durationMinutes: number;
  breakMinutes: number;
  startedAt: string;
  completedAt?: string;
  isCompleted: boolean;
  notes?: string;
}

// 倒计时
export interface Countdown {
  id: string;
  title: string;
  targetDate: string;
  icon: string;
  color: string;
  isPinned: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// 过滤器
export interface Filter {
  id: string;
  name: string;
  icon: string;
  conditions: FilterCondition[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FilterCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'in';
  value: any;
}
