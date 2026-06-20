import { useState } from 'react';
import TaskList from '../components/TaskList';
import AddTask from '../components/AddTask';
import type { Task, Priority } from '../types';

export default function Week() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleAddTask = (newTask: { title: string; priority: Priority; dueDate?: string }) => {
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      completed: false,
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      repeatRule: 'none',
      listId: '1',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks([task, ...tasks]);
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // 获取未来7天的日期
  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  // 按日期分组任务
  const getTasksByDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const formatDateHeader = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return '今天';
    if (date.toDateString() === tomorrow.toDateString()) return '明天';

    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* 页面标题 */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-semibold text-gray-900">最近7天</h1>
        <p className="text-sm text-gray-500 mt-1">查看和管理本周任务</p>
      </div>

      {/* 添加任务 */}
      <AddTask onAdd={handleAddTask} />

      {/* 按日期分组的任务列表 */}
      <div className="bg-white">
        {weekDates.map((date) => {
          const dateTasks = getTasksByDate(date);
          return (
            <div key={date.toISOString()} className="border-b border-gray-100 last:border-0">
              {/* 日期标题 */}
              <div className="px-6 py-3 bg-gray-50 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {formatDateHeader(date)}
                </span>
                <span className="text-xs text-gray-500">
                  {date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                </span>
              </div>

              {/* 该日期的任务 */}
              {dateTasks.length > 0 ? (
                <TaskList
                  tasks={dateTasks}
                  onToggle={handleToggleTask}
                  onDelete={handleDeleteTask}
                />
              ) : (
                <div className="px-6 py-4 text-sm text-gray-400 text-center">
                  暂无任务
                </div>
              )}
            </div>
          );
        })}

        {/* 无日期任务 */}
        {tasks.some(t => !t.dueDate) && (
          <div>
            <div className="px-6 py-3 bg-gray-50">
              <span className="text-sm font-medium text-gray-700">无日期</span>
            </div>
            <TaskList
              tasks={tasks.filter(t => !t.dueDate)}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
            />
          </div>
        )}
      </div>
    </div>
  );
}
