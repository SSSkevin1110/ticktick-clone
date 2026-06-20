import { useState, useEffect } from 'react';
import { Plus, Clock } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useCountdownStore } from '../stores/countdownStore';
import CountdownCard from '../components/countdown/CountdownCard';
import CountdownForm from '../components/countdown/CountdownForm';
import type { Countdown } from '../types';

/**
 * 倒计时页面
 * - 置顶的倒计时卡片
 * - 其他倒计时卡片（网格布局）
 * - 添加倒计时按钮
 * - 空状态提示
 */
export default function Countdown() {
  const { user } = useAuthStore();
  const {
    countdowns,
    isLoading,
    fetchCountdowns,
    createCountdown,
    updateCountdown,
    deleteCountdown,
    togglePin,
  } = useCountdownStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCountdown, setEditingCountdown] = useState<Countdown | null>(null);

  // 初始化时获取倒计时数据
  useEffect(() => {
    if (user?.id) {
      fetchCountdowns(user.id);
    }
  }, [user?.id, fetchCountdowns]);

  // 创建/编辑倒计时
  const handleSubmit = async (data: Omit<Countdown, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.id) return;

    if (editingCountdown) {
      await updateCountdown(editingCountdown.id, data);
    } else {
      await createCountdown(data, user.id);
    }
    setEditingCountdown(null);
  };

  // 编辑倒计时
  const handleEdit = (countdown: Countdown) => {
    setEditingCountdown(countdown);
    setIsFormOpen(true);
  };

  // 删除倒计时
  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个倒计时吗？')) {
      await deleteCountdown(id);
    }
  };

  // 置顶/取消置顶
  const handleTogglePin = async (id: string) => {
    await togglePin(id);
  };

  // 打开创建表单
  const handleOpenCreate = () => {
    setEditingCountdown(null);
    setIsFormOpen(true);
  };

  // 分离置顶和未置顶的倒计时
  const pinnedCountdowns = countdowns.filter((c) => c.isPinned);
  const unpinnedCountdowns = countdowns.filter((c) => !c.isPinned);

  // 加载骨架屏
  if (isLoading) {
    return (
      <div className="w-full px-6 py-6">
        <div className="pt-6 pb-4">
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-40 bg-gray-100 rounded mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 bg-gray-50 rounded-xl animate-pulse">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="h-10 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/4" />
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
        <h1 className="text-2xl font-semibold text-gray-900">倒计时</h1>
        <p className="text-sm text-gray-500 mt-1">记录重要时刻，把握每一天</p>
      </div>

      <div>
        {countdowns.length === 0 ? (
          /* 空状态 */
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Clock className="w-12 h-12 mb-4" />
            <p className="text-lg">还没有倒计时</p>
            <p className="text-sm mt-1">创建你的第一个倒计时，不错过重要时刻</p>
            <button
              onClick={handleOpenCreate}
              className="mt-6 px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium"
            >
              创建倒计时
            </button>
          </div>
        ) : (
          <>
            {/* 添加倒计时按钮 */}
            <button
              onClick={handleOpenCreate}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-400 hover:text-indigo-500 transition-colors mb-6"
            >
              <Plus size={18} />
              <span className="text-sm font-medium">添加倒计时</span>
            </button>

            {/* 置顶的倒计时 */}
            {pinnedCountdowns.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
                  置顶
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pinnedCountdowns.map((countdown) => (
                    <CountdownCard
                      key={countdown.id}
                      countdown={countdown}
                      onTogglePin={handleTogglePin}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 其他倒计时 */}
            {unpinnedCountdowns.length > 0 && (
              <div>
                {pinnedCountdowns.length > 0 && (
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
                    所有倒计时
                  </h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unpinnedCountdowns.map((countdown) => (
                    <CountdownCard
                      key={countdown.id}
                      countdown={countdown}
                      onTogglePin={handleTogglePin}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 倒计时表单模态框 */}
      <CountdownForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCountdown(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingCountdown}
      />
    </div>
  );
}
