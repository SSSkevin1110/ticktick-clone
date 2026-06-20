import { useState } from 'react';
import TaskList from '../components/TaskList';
import AddTask from '../components/AddTask';
import type { Task, Priority } from '../types';

export default function Today() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleAddTask = (newTask: { title: string; priority: Priority; dueDate?: string }) => {
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      completed: false,
      priority: newTask.priority,
      dueDate: new Date().toISOString(), // 默认设为今天
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

  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="max-w-3xl mx-auto">
      {/* 页面标题 */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-semibold text-gray-900">今天</h1>
        <p className="text-sm text-gray-500 mt-1">{dateStr}</p>
      </div>

      {/* 添加任务 */}
      <AddTask onAdd={handleAddTask} />

      {/* 任务列表 */}
      <div className="bg-white">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <span className="text-5xl mb-4">☀️</span>
            <p className="text-lg">今天没有任务</p>
            <p className="text-sm mt-1">享受轻松的一天，或添加新任务</p>
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            onToggle={handleToggleTask}
            onDelete={handleDeleteTask}
          />
        )}
      </div>
    </div>
  );
}
