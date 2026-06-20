import { useState } from 'react';
import TaskList from '../components/TaskList';
import AddTask from '../components/AddTask';
import type { Task, Priority } from '../types';

// 临时模拟数据
const mockTasks: Task[] = [
  {
    id: '1',
    title: '完成项目报告',
    description: '整理本周工作进展',
    completed: false,
    priority: 'high',
    dueDate: new Date().toISOString(),
    repeatRule: 'none',
    listId: '2',
    tags: ['工作'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: '去超市购物',
    description: '牛奶、面包、水果',
    completed: false,
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    repeatRule: 'none',
    listId: '1',
    tags: ['个人'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: '学习React',
    description: '完成官方教程',
    completed: true,
    priority: 'low',
    dueDate: new Date(Date.now() - 86400000).toISOString(),
    repeatRule: 'weekly',
    listId: '3',
    tags: ['学习'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: '预约牙医',
    completed: false,
    priority: 'none',
    repeatRule: 'none',
    listId: '1',
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function AllTasks() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

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
      task.id === id
        ? {
            ...task,
            completed: !task.completed,
            completedAt: !task.completed ? new Date().toISOString() : undefined,
          }
        : task
    ));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.filter(t => !t.completed).length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* 页面标题 */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-semibold text-gray-900">全部任务</h1>
        <p className="text-sm text-gray-500 mt-1">
          {pendingCount} 个待完成，{completedCount} 个已完成
        </p>
      </div>

      {/* 添加任务 */}
      <AddTask onAdd={handleAddTask} />

      {/* 任务列表 */}
      <div className="bg-white">
        {/* 待完成任务 */}
        {tasks.some(t => !t.completed) && (
          <div>
            <div className="px-6 py-2 bg-gray-50">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                待完成 ({pendingCount})
              </span>
            </div>
            <TaskList
              tasks={tasks.filter(t => !t.completed)}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
            />
          </div>
        )}

        {/* 已完成任务 */}
        {tasks.some(t => t.completed) && (
          <div>
            <div className="px-6 py-2 bg-gray-50">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                已完成 ({completedCount})
              </span>
            </div>
            <TaskList
              tasks={tasks.filter(t => t.completed)}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
            />
          </div>
        )}
      </div>
    </div>
  );
}
