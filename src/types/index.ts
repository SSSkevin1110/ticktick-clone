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

// 视图类型
export type ViewType = 'all' | 'today' | 'week' | 'calendar' | 'list';

// 排序方式
export type SortBy = 'dueDate' | 'priority' | 'title' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

// 过滤器
export interface Filter {
  id: string;
  name: string;
  conditions: FilterCondition[];
}

export interface FilterCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
  value: string;
}
