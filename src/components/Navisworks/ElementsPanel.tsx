import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Layers,
  Filter,
} from 'lucide-react';
import type { ElementData } from '../../types/navisworks.types';

interface ElementsPanelProps {
  elements: ElementData[];
  selectedElementId: string | null;
  hiddenElements: Set<string>;
  onElementSelect: (elementId: string) => void;
  onElementHover: (elementId: string | null) => void;
  onToggleVisibility: (elementId: string) => void;
  onClose: () => void;
}

export function ElementsPanel({
  elements,
  selectedElementId,
  hiddenElements,
  onElementSelect,
  onElementHover,
  onToggleVisibility,
  onClose,
}: ElementsPanelProps) {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['All']));
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('tree');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    elements.forEach((el) => {
      if (el.category) cats.add(el.category);
    });
    return ['All', ...Array.from(cats).sort()];
  }, [elements]);

  // Filter elements
  const filteredElements = useMemo(() => {
    return elements.filter((el) => {
      // Filter by category
      if (selectedCategory && selectedCategory !== 'All' && el.category !== selectedCategory) {
        return false;
      }

      // Filter by search
      if (searchText) {
        const search = searchText.toLowerCase();
        return (
          el.name.toLowerCase().includes(search) ||
          el.path.toLowerCase().includes(search) ||
          el.category.toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [elements, selectedCategory, searchText]);

  // Group by category
  const elementsByCategory = useMemo(() => {
    const groups: Record<string, ElementData[]> = {};
    filteredElements.forEach((el) => {
      const cat = el.category || 'Unknown';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(el);
    });
    return groups;
  }, [filteredElements]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const visibleCount = elements.length - hiddenElements.size;

  return (
    <div className="absolute top-4 left-80 w-96 max-h-[calc(100vh-2rem)] bg-gray-900 border border-gray-700 rounded-lg shadow-2xl flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-white" />
            <h3 className="text-white font-bold text-lg">العناصر</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="بحث..."
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>

        {/* Stats */}
        <div className="mt-2 text-sm text-purple-100">
          <span className="font-bold">{visibleCount}</span> / {elements.length} مرئي •{' '}
          <span className="font-bold">{filteredElements.length}</span> مصفى
        </div>
      </div>

      {/* Filters */}
      <div className="p-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat} ({elements.filter((el) => cat === 'All' || el.category === cat).length})
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded transition ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400'
              }`}
              title="List View"
            >
              <div className="w-4 h-4 flex flex-col gap-0.5">
                <div className="h-1 bg-current rounded" />
                <div className="h-1 bg-current rounded" />
                <div className="h-1 bg-current rounded" />
              </div>
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`p-1 rounded transition ${
                viewMode === 'tree' ? 'bg-blue-600 text-white' : 'text-gray-400'
              }`}
              title="Tree View"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <Layers className="w-3 h-3" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Elements List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {viewMode === 'list' ? (
          // List View
          <>
            {filteredElements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                لم يتم العثور على عناصر
              </div>
            ) : (
              filteredElements.map((element) => (
                <ElementItem
                  key={element.id}
                  element={element}
                  isSelected={element.id === selectedElementId}
                  isHidden={hiddenElements.has(element.id)}
                  onSelect={() => onElementSelect(element.id)}
                  onHover={() => onElementHover(element.id)}
                  onLeave={() => onElementHover(null)}
                  onToggleVisibility={() => onToggleVisibility(element.id)}
                />
              ))
            )}
          </>
        ) : (
          // Tree View (grouped by category)
          <>
            {Object.keys(elementsByCategory).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                لم يتم العثور على عناصر
              </div>
            ) : (
              Object.entries(elementsByCategory).map(([category, categoryElements]) => (
                <div key={category} className="mb-2">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-750 rounded-lg transition text-left"
                  >
                    {expandedCategories.has(category) ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-white font-medium text-sm flex-1">
                      {category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {categoryElements.length}
                    </span>
                  </button>

                  {expandedCategories.has(category) && (
                    <div className="ml-6 mt-1 space-y-1">
                      {categoryElements.map((element) => (
                        <ElementItem
                          key={element.id}
                          element={element}
                          isSelected={element.id === selectedElementId}
                          isHidden={hiddenElements.has(element.id)}
                          onSelect={() => onElementSelect(element.id)}
                          onHover={() => onElementHover(element.id)}
                          onLeave={() => onElementHover(null)}
                          onToggleVisibility={() => onToggleVisibility(element.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ElementItem({
  element,
  isSelected,
  isHidden,
  onSelect,
  onHover,
  onLeave,
  onToggleVisibility,
}: {
  element: ElementData;
  isSelected: boolean;
  isHidden: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
  onToggleVisibility: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition cursor-pointer group ${
        isSelected
          ? 'bg-blue-600 text-white'
          : isHidden
          ? 'bg-gray-800/50 text-gray-500'
          : 'bg-gray-800 text-gray-300 hover:bg-gray-750'
      }`}
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Visibility Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility();
        }}
        className="flex-shrink-0 p-1 rounded hover:bg-gray-700 transition"
      >
        {isHidden ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
      </button>

      {/* Element Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate" title={element.name}>
          {element.name}
        </div>
        {element.metadata?.layer && (
          <div className="text-xs opacity-70 truncate">
            {element.metadata.layer}
          </div>
        )}
      </div>

      {/* Geometry Indicator */}
      {element.geometry && (
        <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full" title="Has geometry" />
      )}
    </div>
  );
}
