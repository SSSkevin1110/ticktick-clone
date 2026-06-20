import { useState, useEffect, useMemo } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useHabitStore } from '../stores/habitStore';
import HabitCard from '../components/habits/HabitCard';
import HabitForm from '../components/habits/HabitForm';
import HabitStats from '../components/habits/HabitStats';
import type { Habit } from '../types';

/**
 * 习惯追踪页面
 * - 顶部：今日习惯列表
 * - 中间：添加习惯按钮
 * - 底部：统计区域（选择习惯后显示统计）
 * - 空状态：引导创建第一个习惯
 */
export default function Habits() {
  const { user } = useAuthStore();
  const {
    habits,
    habitLogs,
    isLoading,
    fetchHabits,
    fetchHabitLogs,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabitLog,
  } = useHabitStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  // 初始化时获取习惯数据
  useEffect(() => {
    if (user?.id) {
      fetchHabits(user.id);
    }
  }, [user?.id, fetchHabits]);

  // 获取打卡记录（最近60天，用于热力图）
  useEffect(() => {
    const loadLogs = async () => {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 60);
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = today.toISOString().split('T')[0];

      for (const habit of habits) {
        await fetchHabitLogs(habit.id, startStr, endStr);
      }
    };

    if (habits.length > 0) {
      loadLogs();
    }
  }, [habits, fetchHabitLogs]);

  // 获取选中习惯的打卡记录
  const selectedHabit = habits.find((h) => h.id === selectedHabitId);
  const selectedHabitLogs = useMemo(
    () => habitLogs.filter((l) => l.habitId === selectedHabitId),
    [habitLogs, selectedHabitId]
  );

  // 创建/编辑习惯
  const handleSubmit = async (habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.id) return;

    if (editingHabit) {
      await updateHabit(editingHabit.id, habitData);
    } else {
      await createHabit(habitData, user.id);
    }
    setEditingHabit(null);
  };

  // 编辑习惯
  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsFormOpen(true);
  };

  // 删除习惯
  const handleDelete = async (habitId: string) => {
    if (window.confirm('确定要删除这个习惯吗？')) {
      await deleteHabit(habitId);
      if (selectedHabitId === habitId) {
        setSelectedHabitId(null);
      }
    }
  };

  // 打卡/取消打卡
  const handleToggle = async (habitId: string, date: string) => {
    await toggleHabitLog(habitId, date);
  };

  // 打开创建表单
  const handleOpenCreate = () => {
    setEditingHabit(null);
    setIsFormOpen(true);
  };

  // 加载骨架屏
  if (isLoading) {
    return (
      <div className="w-full px-6 py-6">
        <div className="pt-6 pb-4">
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-40 bg-gray-100 rounded mt-2 animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-xl animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-6">
      {/* 页面标题 */}
      <div className="pt-6 pb-4">
        <h1 className="text-2xl font-semibold text-gray-900">习惯追踪</h1>
        <p className="text-sm text-gray-500 mt-1">坚持打卡，养成好习惯</p>
      </div>

      {/* 今日习惯列表 */}
      <div className="space-y-3">
        {habits.length === 0 ? (
          /* 空状态 */
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Sparkles className="w-12 h-12 mb-4" />
            <p className="text-lg">还没有习惯</p>
            <p className="text-sm mt-1">创建你的第一个习惯，开始打卡之旅</p>
            <button
              onClick={handleOpenCreate}
              className="mt-6 px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium"
            >
              创建习惯
            </button>
          </div>
        ) : (
          <>
            {/* 添加习惯按钮 */}
            <button
              onClick={handleOpenCreate}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-400 hover:text-indigo-500 transition-colors"
            >
              <Plus size={18} />
              <span className="text-sm font-medium">添加习惯</span>
            </button>

            {/* 习惯卡片列表 */}
            {habits.map((habit) => (
              <div
                key={habit.id}
                className={`cursor-pointer transition-all ${
                  selectedHabitId === habit.id ? 'ring-2 ring-indigo-500 rounded-xl' : ''
                }`}
                onClick={() =>
                  setSelectedHabitId(selectedHabitId === habit.id ? null : habit.id)
                }
              >
                <HabitCard
                  habit={habit}
                  logs={habitLogs.filter((l) => l.habitId === habit.id)}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </>
        )}
      </div>

      {/* 统计区域 */}
      {selectedHabit && selectedHabitLogs.length > 0 && (
        <div className="mt-6 pb-6">
          <div className="text-sm font-medium text-gray-700 mb-3">
            {selectedHabit.icon} {selectedHabit.name} 统计
          </div>
          <HabitStats habit={selectedHabit} logs={selectedHabitLogs} />
        </div>
      )}

      {/* 习惯表单模态框 */}
      <HabitForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingHabit(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingHabit}
      />
    </div>
  );
}
