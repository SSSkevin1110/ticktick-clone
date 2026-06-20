import { useState, useRef, useEffect, useMemo } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { useTagStore } from '../stores/tagStore';
import { useAuthStore } from '../stores/authStore';
import { showToast } from './Toast';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

/**
 * 标签选择器组件
 * - 显示已选标签（可移除）
 * - 输入框搜索/创建标签
 * - 下拉列表显示匹配的标签
 * - 点击标签切换选中状态
 * - 输入新标签名+回车创建并选中
 */
export default function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
  const { tags, fetchTags, createTag } = useTagStore();
  const { user } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 初始化时获取标签
  useEffect(() => {
    if (user?.id) {
      fetchTags(user.id);
    }
  }, [user?.id, fetchTags]);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 过滤匹配的标签
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tags;
    const query = searchQuery.toLowerCase();
    return tags.filter((tag) => tag.name.toLowerCase().includes(query));
  }, [tags, searchQuery]);

  // 检查输入的标签名是否已存在
  const inputTagExists = useMemo(() => {
    if (!searchQuery.trim()) return false;
    return tags.some((tag) => tag.name.toLowerCase() === searchQuery.toLowerCase());
  }, [tags, searchQuery]);

  // 切换标签选中状态
  const handleToggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onTagsChange(selectedTags.filter((t) => t !== tagName));
    } else {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  // 移除标签
  const handleRemoveTag = (tagName: string) => {
    onTagsChange(selectedTags.filter((t) => t !== tagName));
  };

  // 创建新标签并选中
  const handleCreateAndSelectTag = async () => {
    if (!searchQuery.trim() || !user?.id) return;

    // 检查标签是否已存在
    if (tags.some((t) => t.name.toLowerCase() === searchQuery.toLowerCase())) {
      // 标签已存在，直接选中
      if (!selectedTags.includes(searchQuery.trim())) {
        onTagsChange([...selectedTags, searchQuery.trim()]);
      }
      setSearchQuery('');
      setIsDropdownOpen(false);
      return;
    }

    // 创建新标签
    const newTag = await createTag({ name: searchQuery.trim(), color: '#6366F1' }, user.id);
    if (newTag) {
      onTagsChange([...selectedTags, newTag.name]);
      setSearchQuery('');
      setIsDropdownOpen(false);
      showToast('标签已创建', 'success');
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* 已选标签 */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedTags.map((tagName) => {
            const tagInfo = tags.find((t) => t.name === tagName);
            return (
              <span
                key={tagName}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded-md"
                style={{
                  backgroundColor: tagInfo ? `${tagInfo.color}20` : '#EEF2FF',
                  color: tagInfo ? tagInfo.color : '#4F46E5',
                }}
              >
                {tagName}
                <button
                  onClick={() => handleRemoveTag(tagName)}
                  className="hover:opacity-70 transition-opacity"
                >
                  <X size={10} />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* 输入框 */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsDropdownOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                handleCreateAndSelectTag();
              }
              if (e.key === 'Escape') {
                setIsDropdownOpen(false);
              }
            }}
            placeholder="搜索或创建标签..."
            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* 下拉列表 */}
      {isDropdownOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
          {/* 创建新标签选项 */}
          {searchQuery.trim() && !inputTagExists && (
            <button
              onClick={handleCreateAndSelectTag}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <Plus size={14} />
              <span>创建标签 "{searchQuery.trim()}"</span>
            </button>
          )}

          {/* 标签列表 */}
          {filteredTags.length > 0 ? (
            filteredTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleToggleTag(tag.name)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                  selectedTags.includes(tag.name)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="flex-1 text-left">{tag.name}</span>
                {selectedTags.includes(tag.name) && (
                  <span className="text-indigo-500">
                    <Tag size={12} />
                  </span>
                )}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-xs text-gray-400 text-center">无匹配标签</div>
          )}
        </div>
      )}
    </div>
  );
}
