import { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Tag,
  ListChecks,
  MessageSquare,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import { useTaskStore } from '../stores/taskStore';
import type { Priority } from '../types';

/**
 * 子任务类型
 */
interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

/**
 * 评论类型
 */
interface Comment {
  id: string;
  content: string;
  createdAt: string;
}

/**
 * 任务详情面板
 * - 宽度 400px，右侧滑入
 * - 显示任务所有字段
 * - 支持编辑每个字段
 * - 子任务添加和管理
 * - 评论输入和显示
 */
export default function TaskDetail() {
  const { selectedTaskId, selectTask } = useUIStore();
  const { tasks, updateTask } = useTaskStore();
  const task = tasks.find((t) => t.id === selectedTaskId);

  // 本地编辑状态
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('none');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // 子任务（本地 mock，后续可接入 Supabase）
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [newSubTask, setNewSubTask] = useState('');

  // 评论（本地 mock）
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  // 当任务变化时同步本地状态
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setDueDate(task.dueDate || '');
      setDueTime(task.dueTime || '');
      setTags(task.tags || []);
    }
  }, [task?.id]);

  // 保存更改
  const handleSave = async () => {
    if (!task) return;
    await updateTask(task.id, {
      title,
      description,
      priority,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      tags,
    });
  };

  // 添加标签
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setTagInput('');
      if (task) updateTask(task.id, { tags: newTags });
    }
  };

  // 删除标签
  const handleRemoveTag = (tag: string) => {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    if (task) updateTask(task.id, { tags: newTags });
  };

  // 添加子任务
  const handleAddSubTask = () => {
    if (newSubTask.trim()) {
      setSubTasks([
        ...subTasks,
        { id: Date.now().toString(), title: newSubTask.trim(), completed: false },
      ]);
      setNewSubTask('');
    }
  };

  // 切换子任务完成
  const toggleSubTask = (id: string) => {
    setSubTasks(subTasks.map((st) => (st.id === id ? { ...st, completed: !st.completed } : st)));
  };

  // 删除子任务
  const removeSubTask = (id: string) => {
    setSubTasks(subTasks.filter((st) => st.id !== id));
  };

  // 添加评论
  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([
        ...comments,
        {
          id: Date.now().toString(),
          content: newComment.trim(),
          createdAt: new Date().toISOString(),
        },
      ]);
      setNewComment('');
    }
  };

  // 优先级选项
  const priorityOptions: { value: Priority; label: string; color: string }[] = [
    { value: 'none', label: '无优先级', color: 'bg-gray-300' },
    { value: 'low', label: '低', color: 'bg-blue-500' },
    { value: 'medium', label: '中', color: 'bg-yellow-500' },
    { value: 'high', label: '高', color: 'bg-red-500' },
  ];

  // 未选中任何任务
  if (!selectedTaskId || !task) return null;

  return (
    <>
      {/* 遮罩层 - 移动端点击关闭 */}
      <div
        className="fixed inset-0 bg-black/30 z-30 lg:hidden"
        onClick={() => selectTask(null)}
      />

      {/* 详情面板 */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[400px] bg-white border-l border-gray-200 z-40 flex flex-col animate-[slideInRight_200ms_ease] shadow-xl">
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">任务详情</h2>
          <button
            onClick={() => selectTask(null)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 内容区 - 可滚动 */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* 标题 */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSave}
              className="w-full text-lg font-medium text-gray-900 outline-none placeholder-gray-400 bg-transparent"
              placeholder="任务标题"
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSave}
              placeholder="添加描述..."
              rows={3}
              className="w-full text-sm text-gray-700 outline-none border border-gray-200 rounded-lg p-3 resize-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* 优先级 */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block">优先级</label>
            <div className="flex gap-2">
              {priorityOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setPriority(opt.value);
                    if (task) updateTask(task.id, { priority: opt.value });
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    priority === opt.value
                      ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${opt.color}`} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 日期 */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                <Calendar size={12} className="inline mr-1" />
                日期
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (task) updateTask(task.id, { dueDate: e.target.value || undefined });
                }}
                className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                <Clock size={12} className="inline mr-1" />
                时间
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => {
                  setDueTime(e.target.value);
                  if (task) updateTask(task.id, { dueTime: e.target.value || undefined });
                }}
                className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* 标签 */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block">
              <Tag size={12} className="inline mr-1" />
              标签
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-md"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="text-indigo-400 hover:text-indigo-600"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTag();
                }}
                placeholder="输入标签名..."
                className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={handleAddTag}
                className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                添加
              </button>
            </div>
          </div>

          {/* 子任务 */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block">
              <ListChecks size={12} className="inline mr-1" />
              子任务 ({subTasks.filter((st) => st.completed).length}/{subTasks.length})
            </label>
            <div className="space-y-1.5">
              {subTasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg group"
                >
                  <button
                    onClick={() => toggleSubTask(st.id)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      st.completed
                        ? 'bg-indigo-500 border-indigo-500'
                        : 'border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {st.completed && <Check size={10} className="text-white" />}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      st.completed ? 'text-gray-400 line-through' : 'text-gray-700'
                    }`}
                  >
                    {st.title}
                  </span>
                  <button
                    onClick={() => removeSubTask(st.id)}
                    className="p-0.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newSubTask}
                onChange={(e) => setNewSubTask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSubTask();
                }}
                placeholder="添加子任务..."
                className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={handleAddSubTask}
                className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          {/* 评论 */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block">
              <MessageSquare size={12} className="inline mr-1" />
              评论 ({comments.length})
            </label>
            <div className="space-y-2">
              {comments.map((c) => (
                <div key={c.id} className="px-3 py-2 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{c.content}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(c.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddComment();
                }}
                placeholder="添加评论..."
                className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={handleAddComment}
                className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                发送
              </button>
            </div>
          </div>
        </div>

        {/* 底部元信息 */}
        <div className="px-5 py-3 border-t border-gray-200 text-xs text-gray-400">
          <div>创建于 {new Date(task.createdAt).toLocaleString('zh-CN')}</div>
          <div>更新于 {new Date(task.updatedAt).toLocaleString('zh-CN')}</div>
        </div>
      </div>
    </>
  );
}
