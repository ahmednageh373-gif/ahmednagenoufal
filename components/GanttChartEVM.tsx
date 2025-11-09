/**
 * ═══════════════════════════════════════════════════════════════
 * Gantt Chart مع EVM متكامل
 * Gantt Chart with Integrated EVM Tracking
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Download,
  ZoomIn,
  ZoomOut,
  Filter,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface GanttActivity {
  id: string;
  code: string;
  name: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  progress: number;
  isCritical: boolean;
  dependencies: string[];
  // EVM Data
  plannedCost: number;
  actualCost: number;
  earnedValue: number;
  cpi: number;
  spi: number;
  // Visual
  color: string;
  category: string;
}

interface GanttChartProps {
  activities: GanttActivity[];
  projectStart: Date;
  projectEnd: Date;
  onActivityClick?: (activity: GanttActivity) => void;
}

// ═══════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
};

const getDaysBetween = (start: Date, end: Date): number => {
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// ═══════════════════════════════════════════════════════════════
// Activity Row Component
// ═══════════════════════════════════════════════════════════════

interface ActivityRowProps {
  activity: GanttActivity;
  projectStart: Date;
  totalDays: number;
  dayWidth: number;
  onClick?: () => void;
}

const ActivityRow: React.FC<ActivityRowProps> = ({
  activity,
  projectStart,
  totalDays,
  dayWidth,
  onClick,
}) => {
  const startOffset = getDaysBetween(projectStart, activity.startDate);
  const duration = getDaysBetween(activity.startDate, activity.endDate);
  const leftPosition = (startOffset / totalDays) * 100;
  const width = (duration / totalDays) * 100;

  const getStatusColor = () => {
    if (activity.progress === 100) return 'bg-green-500';
    if (activity.progress === 0) return 'bg-gray-300';
    if (activity.cpi < 0.9 || activity.spi < 0.9) return 'bg-red-500';
    if (activity.cpi < 1.0 || activity.spi < 1.0) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getBorderColor = () => {
    if (activity.isCritical) return 'border-red-600';
    return 'border-gray-300';
  };

  return (
    <div
      className="relative h-12 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      {/* Activity Bar */}
      <div
        className="absolute top-2 h-8"
        style={{
          left: `${leftPosition}%`,
          width: `${width}%`,
          minWidth: '2px',
        }}
      >
        <div className={`relative h-full rounded ${getBorderColor()} border-2 overflow-hidden`}>
          {/* Progress Fill */}
          <div
            className={`h-full ${getStatusColor()} transition-all`}
            style={{ width: `${activity.progress}%` }}
          />
          
          {/* Activity Label */}
          <div className="absolute inset-0 flex items-center justify-center px-2">
            <span className="text-xs font-medium text-white truncate" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              {activity.name}
            </span>
          </div>

          {/* Critical Path Indicator */}
          {activity.isCritical && (
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-bl">
              <AlertTriangle className="w-2 h-2 text-white m-0.5" />
            </div>
          )}

          {/* Completed Indicator */}
          {activity.progress === 100 && (
            <div className="absolute top-0 left-0 w-3 h-3 bg-green-600 rounded-br">
              <CheckCircle className="w-2 h-2 text-white m-0.5" />
            </div>
          )}
        </div>

        {/* EVM Indicators */}
        <div className="absolute -bottom-4 left-0 flex gap-1 text-xs">
          {activity.cpi < 0.9 && (
            <span className="bg-red-100 text-red-800 px-1 rounded" title={`CPI: ${activity.cpi.toFixed(2)}`}>
              CPI↓
            </span>
          )}
          {activity.spi < 0.9 && (
            <span className="bg-orange-100 text-orange-800 px-1 rounded" title={`SPI: ${activity.spi.toFixed(2)}`}>
              SPI↓
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Timeline Header Component
// ═══════════════════════════════════════════════════════════════

interface TimelineHeaderProps {
  projectStart: Date;
  totalDays: number;
  dayWidth: number;
}

const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  projectStart,
  totalDays,
  dayWidth,
}) => {
  const weeks = Math.ceil(totalDays / 7);
  
  return (
    <div className="border-b-2 border-gray-300 bg-gray-50">
      {/* Month/Week Headers */}
      <div className="h-8 flex items-center border-b border-gray-200 relative">
        {Array.from({ length: weeks }).map((_, weekIndex) => {
          const weekStart = addDays(projectStart, weekIndex * 7);
          const monthName = weekStart.toLocaleDateString('ar-SA', { month: 'short' });
          
          return (
            <div
              key={weekIndex}
              className="flex-1 text-center text-xs font-medium text-gray-600 border-l border-gray-200"
              style={{ minWidth: `${7 * dayWidth}px` }}
            >
              {weekIndex % 4 === 0 && monthName}
            </div>
          );
        })}
      </div>

      {/* Day Numbers */}
      <div className="h-6 flex relative">
        {Array.from({ length: totalDays }).map((_, dayIndex) => {
          const currentDate = addDays(projectStart, dayIndex);
          const isWeekend = currentDate.getDay() === 5 || currentDate.getDay() === 6;
          
          return (
            <div
              key={dayIndex}
              className={`flex-shrink-0 text-center text-xs ${
                isWeekend ? 'bg-gray-100 text-gray-400' : 'text-gray-600'
              } border-l border-gray-200`}
              style={{ width: `${dayWidth}px` }}
            >
              {currentDate.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Main Gantt Chart Component
// ═══════════════════════════════════════════════════════════════

export const GanttChartEVM: React.FC<GanttChartProps> = ({
  activities,
  projectStart,
  projectEnd,
  onActivityClick,
}) => {
  const [zoom, setZoom] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const totalDays = getDaysBetween(projectStart, projectEnd);
  const baseDayWidth = 30;
  const dayWidth = baseDayWidth * zoom;

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    if (showCriticalOnly && !activity.isCritical) return false;
    if (selectedCategory !== 'all' && activity.category !== selectedCategory) return false;
    return true;
  });

  // Get unique categories
  const categories = Array.from(new Set(activities.map(a => a.category)));

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleExport = () => {
    alert('سيتم تصدير مخطط Gantt إلى PDF قريباً');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع الفئات</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Critical Path Toggle */}
            <button
              onClick={() => setShowCriticalOnly(!showCriticalOnly)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                showCriticalOnly
                  ? 'bg-red-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              المسار الحرج فقط
            </button>

            {/* Activity Count */}
            <span className="text-sm text-gray-600">
              {filteredActivities.length} نشاط
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <button
              onClick={handleZoomOut}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              title="تصغير"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              title="تكبير"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              تصدير PDF
            </button>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="flex">
        {/* Left Panel - Activity Names */}
        <div className="w-64 border-r border-gray-200 bg-gray-50">
          <div className="h-14 flex items-center px-4 border-b-2 border-gray-300 font-semibold text-gray-700">
            النشاط
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            {filteredActivities.map(activity => (
              <div
                key={activity.id}
                className="h-12 px-4 flex items-center border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onActivityClick?.(activity)}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">
                    {activity.code}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {activity.name}
                  </div>
                </div>
                {activity.isCritical && (
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Timeline */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 300px)' }}
        >
          <div style={{ minWidth: `${totalDays * dayWidth}px` }}>
            <TimelineHeader
              projectStart={projectStart}
              totalDays={totalDays}
              dayWidth={dayWidth}
            />
            <div className="relative">
              {/* Weekend Highlighting */}
              {Array.from({ length: totalDays }).map((_, dayIndex) => {
                const currentDate = addDays(projectStart, dayIndex);
                const isWeekend = currentDate.getDay() === 5 || currentDate.getDay() === 6;
                
                return isWeekend ? (
                  <div
                    key={dayIndex}
                    className="absolute top-0 bottom-0 bg-gray-100 opacity-50 pointer-events-none"
                    style={{
                      left: `${(dayIndex / totalDays) * 100}%`,
                      width: `${(1 / totalDays) * 100}%`,
                    }}
                  />
                ) : null;
              })}

              {/* Today Line */}
              {(() => {
                const today = new Date();
                if (today >= projectStart && today <= projectEnd) {
                  const todayOffset = getDaysBetween(projectStart, today);
                  const todayPosition = (todayOffset / totalDays) * 100;
                  return (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
                      style={{ left: `${todayPosition}%` }}
                    >
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        اليوم
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Activity Rows */}
              {filteredActivities.map(activity => (
                <ActivityRow
                  key={activity.id}
                  activity={activity}
                  projectStart={projectStart}
                  totalDays={totalDays}
                  dayWidth={dayWidth}
                  onClick={() => onActivityClick?.(activity)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 border-t border-gray-200 p-4">
        <div className="flex items-center gap-6 text-sm">
          <span className="font-semibold text-gray-700">الرموز:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-600">مكتمل</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-gray-600">قيد التنفيذ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-gray-600">تحذير (CPI/SPI &lt; 1.0)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-600">حرج (CPI/SPI &lt; 0.9)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <span className="text-gray-600">لم يبدأ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-red-600 rounded"></div>
            <span className="text-gray-600">المسار الحرج</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChartEVM;
