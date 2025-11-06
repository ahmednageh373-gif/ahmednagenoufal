import React, { useState, useMemo } from 'react';
import { Search, Grid, List, Download, Eye, Filter, Tag, Package } from '../lucide-icons';
import { 
  yqArchBlocks, 
  blockCategories, 
  getBlocksByCategory, 
  searchBlocks,
  getCategoryStats,
  type ArchBlock,
  type BlockCategory 
} from '../data/yqarch-library-data';

interface BlockLibraryProps {
  onSelectBlock?: (block: ArchBlock) => void;
  selectedBlocks?: string[];
}

export const BlockLibrary: React.FC<BlockLibraryProps> = ({ 
  onSelectBlock, 
  selectedBlocks = [] 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    yqArchBlocks.forEach(block => {
      block.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, []);

  // Filter blocks based on search, category, and tags
  const filteredBlocks = useMemo(() => {
    let blocks = yqArchBlocks;

    // Filter by category
    if (selectedCategory !== 'all') {
      blocks = getBlocksByCategory(selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      blocks = blocks.filter(block => {
        const query = searchQuery.toLowerCase();
        return (
          block.nameAr.toLowerCase().includes(query) ||
          block.nameEn.toLowerCase().includes(query) ||
          block.description.toLowerCase().includes(query) ||
          block.tags.some(tag => tag.toLowerCase().includes(query))
        );
      });
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      blocks = blocks.filter(block =>
        selectedTags.some(tag => block.tags.includes(tag))
      );
    }

    return blocks;
  }, [searchQuery, selectedCategory, selectedTags]);

  const categoryStats = getCategoryStats();

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleDownload = (block: ArchBlock) => {
    // Placeholder for download functionality
    console.log('Download block:', block.id);
    alert(`تحميل البلوك: ${block.nameAr}\n(سيتم إضافة رابط التحميل قريباً)`);
  };

  const handlePreview = (block: ArchBlock) => {
    // Placeholder for preview functionality
    console.log('Preview block:', block.id);
    alert(`معاينة البلوك: ${block.nameAr}\n(سيتم إضافة المعاينة قريباً)`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Package size={32} />
          <h1 className="text-3xl font-bold">مكتبة YQArch المعمارية</h1>
        </div>
        <p className="text-indigo-100 dark:text-indigo-200">
          أكثر من {yqArchBlocks.length} بلوك معماري جاهز للاستخدام في مشاريعك
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Search Bar */}
          <div className="relative lg:col-span-2">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="ابحث عن بلوك (الاسم، الوصف، أو التصنيف)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Grid size={20} />
              <span>شبكة</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <List size={20} />
              <span>قائمة</span>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            الكل ({yqArchBlocks.length})
          </button>
          {blockCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.nameAr}</span>
              <span className="text-xs opacity-75">
                ({categoryStats.find(s => s.category === category.id)?.count || 0})
              </span>
            </button>
          ))}
        </div>

        {/* Tag Filters */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
              <Tag size={16} />
              الوسوم المحددة:
            </span>
            {selectedTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-full hover:bg-indigo-700 transition-colors"
              >
                {tag} ×
              </button>
            ))}
            <button
              onClick={() => setSelectedTags([])}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded-full hover:bg-red-700 transition-colors"
            >
              مسح الكل
            </button>
          </div>
        )}

        {/* Results Count */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          عرض {filteredBlocks.length} من {yqArchBlocks.length} بلوك
        </div>
      </div>

      {/* Blocks Display */}
      {filteredBlocks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
          <Filter size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            لا توجد نتائج
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            جرب تغيير معايير البحث أو الفلاتر
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBlocks.map(block => (
            <BlockCard
              key={block.id}
              block={block}
              isSelected={selectedBlocks.includes(block.id)}
              onSelect={() => onSelectBlock?.(block)}
              onDownload={() => handleDownload(block)}
              onPreview={() => handlePreview(block)}
              onTagClick={toggleTag}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    الاسم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    التصنيف
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    الأبعاد
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    الوصف
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredBlocks.map(block => (
                  <BlockRow
                    key={block.id}
                    block={block}
                    onDownload={() => handleDownload(block)}
                    onPreview={() => handlePreview(block)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Block Card Component for Grid View
const BlockCard: React.FC<{
  block: ArchBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDownload: () => void;
  onPreview: () => void;
  onTagClick: (tag: string) => void;
}> = ({ block, isSelected, onSelect, onDownload, onPreview, onTagClick }) => {
  const category = blockCategories.find(c => c.id === block.category);

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
        isSelected ? 'ring-4 ring-indigo-500' : ''
      }`}
    >
      {/* Header with Icon */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white text-center">
        <div className="text-5xl mb-2">{category?.icon || '📦'}</div>
        <h3 className="font-bold text-lg">{block.nameAr}</h3>
        <p className="text-sm text-indigo-100">{block.nameEn}</p>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-3">
          <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-medium rounded-full">
            {category?.nameAr}
          </span>
        </div>

        {block.dimensions && (
          <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
            <strong>الأبعاد:</strong> {block.dimensions}
          </div>
        )}

        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
          {block.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {block.tags.slice(0, 3).map(tag => (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onPreview}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors"
          >
            <Eye size={16} />
            <span>معاينة</span>
          </button>
          <button
            onClick={onDownload}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
          >
            <Download size={16} />
            <span>تحميل</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Block Row Component for List View
const BlockRow: React.FC<{
  block: ArchBlock;
  onDownload: () => void;
  onPreview: () => void;
}> = ({ block, onDownload, onPreview }) => {
  const category = blockCategories.find(c => c.id === block.category);

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{category?.icon || '📦'}</span>
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {block.nameAr}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {block.nameEn}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
          {category?.nameAr}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {block.dimensions || '-'}
      </td>
      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
        <div className="line-clamp-2">{block.description}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex gap-2">
          <button
            onClick={onPreview}
            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={onDownload}
            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
          >
            <Download size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};
