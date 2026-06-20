import { useState } from 'react';
import { useParams } from 'react-router-dom';
import TaskList from '../components/TaskList';
import AddTask from '../components/AddTask';
import type { Task, Priority } from '../types';

// 模拟清单数据
const mockLists: Record<string, { name: string; icon: string; color: string }> = {
  '1': { name: '个人', icon: '👤', color: '#4F46E5' },
  '2': { name: '工作', icon: '💼', color: '#10B981' },
  '3': { name: '学习', icon: '📚', color: '#F59E0B' },
};

export default function ListDetail() {
  const { listId } = useParams<{ listId: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);

  const list = listId ? mockLists[listId] : null;

  if (!list) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">清单不存在</p>
      </div>
    );
  }

  const handleAddTask = (newTask: { title: string; priority: Priority; dueDate?: string }) => {
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      completed: false,
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      repeatRule: 'none',
      listId: listId || '1',
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

  return (
    <div className="max-w-3xl mx-auto">
      {/* 页面标题 */}
      <div className="px-6 pt-6 pb-4 flex items-center gap-3">
        <span className="text-2xl">{list.icon}</span>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{list.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {tasks.filter(t => !t.completed).length} 个待完成
          </p>
        </div>
      </div>

      {/* 添加任务 */}
      <AddTask onAdd={handleAddTask} />

      {/* 任务列表 */}
      <div className="bg-white">
        <TaskList
          tasks={tasks}
          onToggle={handleToggleTask}
          onDelete={handleDeleteTask}
        />
      </div>
    </div>
  );
}
