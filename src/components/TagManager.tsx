import { useState, useEffect } from 'react';
import { X, Pencil, Trash2, Tag } from 'lucide-react';
import { useTagStore } from '../stores/tagStore';
import { useAuthStore } from '../stores/authStore';
import { showToast } from './Toast';

/** 预设颜色 */
const PRESET_COLORS = [
  { name: '红色', value: '#EF4444' },
  { name: '橙色', value: '#F97316' },
  { name: '黄色', value: '#EAB308' },
  { name: '绿色', value: '#22C55E' },
  { name: '蓝色', value: '#3B82F6' },
  { name: '紫色', value: '#A855F7' },
  { name: '粉色', value: '#EC4899' },
  { name: '灰色', value: '#9CA3AF' },
];

interface TagManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 标签管理组件（模态框形式）
 * - 显示所有标签列表
 * - 创建新标签
 * - 编辑/删除标签
 */
export default function TagManager({ isOpen, onClose }: TagManagerProps) {
  const { tags, fetchTags, createTag, updateTag, deleteTag } = useTagStore();
  const { user } = useAuthStore();

  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[4].value); // 默认蓝色
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState('');

  // 初始化时获取标签
  useEffect(() => {
    if (isOpen && user?.id) {
      fetchTags(user.id);
    }
  }, [isOpen, user?.id, fetchTags]);

  // 创建标签
  const handleCreateTag = async () => {
    if (!newTagName.trim() || !user?.id) return;

    // 检查标签名是否已存在
    if (tags.some((t) => t.name === newTagName.trim())) {
      showToast('标签名已存在', 'error');
      return;
    }

    const tag = await createTag({ name: newTagName.trim(), color: newTagColor }, user.id);
    if (tag) {
      setNewTagName('');
      setNewTagColor(PRESET_COLORS[4].value);
      showToast('标签已创建', 'success');
    }
  };

  // 开始编辑标签
  const handleStartEdit = (tag: { id: string; name: string; color: string }) => {
    setEditingTagId(tag.id);
    setEditingName(tag.name);
    setEditingColor(tag.color);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editingTagId || !editingName.trim()) return;

    // 检查标签名是否已存在（排除当前编辑的标签）
    if (tags.some((t) => t.name === editingName.trim() && t.id !== editingTagId)) {
      showToast('标签名已存在', 'error');
      return;
    }

    await updateTag(editingTagId, { name: editingName.trim(), color: editingColor });
    setEditingTagId(null);
    showToast('标签已更新', 'success');
  };

  // 删除标签
  const handleDeleteTag = async (id: string) => {
    await deleteTag(id);
    showToast('标签已删除', 'info');
  };

  // 重置编辑状态
  const handleCancelEdit = () => {
    setEditingTagId(null);
    setEditingName('');
    setEditingColor('');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-[fadeIn_150ms_ease]"
        onClick={onClose}
      />

      {/* 模态框 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md bg-white rounded-lg shadow-xl animate-[slideUp_200ms_ease]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Tag size={18} className="text-indigo-500" />
              <h2 className="text-lg font-semibold text-gray-900">管理标签</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* 创建新标签 */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateTag();
                }}
                placeholder="输入标签名称..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={handleCreateTag}
                disabled={!newTagName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                创建
              </button>
            </div>
            <div className="flex gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setNewTagColor(color.value)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    newTagColor === color.value
                      ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* 标签列表 */}
          <div className="px-6 py-4 max-h-[300px] overflow-y-auto">
            {tags.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-8">暂无标签</div>
            ) : (
              <div className="space-y-2">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 group"
                  >
                    {editingTagId === tag.id ? (
                      /* 编辑模式 */
                      <>
                        <div className="flex gap-1.5">
                          {PRESET_COLORS.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => setEditingColor(color.value)}
                              className={`w-5 h-5 rounded-full transition-transform ${
                                editingColor === color.value
                                  ? 'ring-2 ring-offset-1 ring-indigo-500 scale-110'
                                  : 'hover:scale-110'
                              }`}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            />
                          ))}
                        </div>
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          onBlur={handleSaveEdit}
                          className="flex-1 px-2 py-1 text-sm border border-indigo-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          autoFocus
                        />
                      </>
                    ) : (
                      /* 正常模式 */
                      <>
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="flex-1 text-sm text-gray-700">{tag.name}</span>
                        <button
                          onClick={() => handleStartEdit(tag)}
                          className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag.id)}
                          className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
