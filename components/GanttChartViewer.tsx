/**
 * Gantt Chart Viewer - عارض مخطط جانت مع ألوان وعلامات
 * يعرض الجدول الزمني بتنسيق احترافي مثل ملفات PDF
 */

import React, { useMemo, useState } from 'react';
import { AdvancedScheduleActivity } from '../types';
import { Calendar, Download, Filter, ZoomIn, ZoomOut, Eye } from 'lucide-react';

interface GanttChartViewerProps {
    activities: AdvancedScheduleActivity[];
    projectName: string;
    projectStart: Date;
    projectEnd: Date;
}

type ViewMode = 'days' | 'weeks' | 'months';

interface GanttBar {
    activity: AdvancedScheduleActivity;
    startPos: number;  // percentage
    width: number;     // percentage
    color: string;
    row: number;
}

export const GanttChartViewer: React.FC<GanttChartViewerProps> = ({
    activities,
    projectName,
    projectStart,
    projectEnd
}) => {
    const [viewMode, setViewMode] = useState<ViewMode>('weeks');
    const [showCriticalOnly, setShowCriticalOnly] = useState(false);
    const [filterCategory, setFilterCategory] = useState<string>('all');

    // Get unique categories
    const categories = useMemo(() => {
        const cats = new Set(activities.map(a => a.category));
        return Array.from(cats).sort();
    }, [activities]);

    // Filter activities
    const filteredActivities = useMemo(() => {
        let filtered = activities;
        
        if (showCriticalOnly) {
            filtered = filtered.filter(a => a.isCritical);
        }
        
        if (filterCategory !== 'all') {
            filtered = filtered.filter(a => a.category === filterCategory);
        }
        
        return filtered.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    }, [activities, showCriticalOnly, filterCategory]);

    // Calculate timeline
    const timeline = useMemo(() => {
        const projectDuration = projectEnd.getTime() - projectStart.getTime();
        const totalDays = Math.ceil(projectDuration / (1000 * 60 * 60 * 24));
        
        let intervals: Date[] = [];
        let intervalLabel: (d: Date) => string;
        
        if (viewMode === 'days') {
            // Show every day
            for (let i = 0; i <= totalDays; i += 1) {
                const date = new Date(projectStart);
                date.setDate(date.getDate() + i);
                intervals.push(date);
            }
            intervalLabel = (d) => `${d.getDate()}/${d.getMonth() + 1}`;
        } else if (viewMode === 'weeks') {
            // Show every week
            for (let i = 0; i <= totalDays; i += 7) {
                const date = new Date(projectStart);
                date.setDate(date.getDate() + i);
                intervals.push(date);
            }
            intervalLabel = (d) => `W${Math.ceil((d.getTime() - projectStart.getTime()) / (7 * 24 * 60 * 60 * 1000))}`;
        } else {
            // Show every month
            let current = new Date(projectStart);
            while (current <= projectEnd) {
                intervals.push(new Date(current));
                current.setMonth(current.getMonth() + 1);
            }
            intervalLabel = (d) => `${d.toLocaleDateString('ar-SA', { month: 'short', year: '2-digit' })}`;
        }
        
        return { intervals, intervalLabel, totalDays };
    }, [projectStart, projectEnd, viewMode]);

    // Calculate Gantt bars
    const ganttBars: GanttBar[] = useMemo(() => {
        const projectDuration = projectEnd.getTime() - projectStart.getTime();
        
        return filteredActivities.map((activity, index) => {
            const actStart = activity.startDate.getTime();
            const actEnd = activity.endDate.getTime();
            const actDuration = actEnd - actStart;
            
            // Calculate position as percentage
            const startPos = ((actStart - projectStart.getTime()) / projectDuration) * 100;
            const width = (actDuration / projectDuration) * 100;
            
            // Determine color based on activity type and status
            let color = '#3b82f6'; // Default blue
            
            if (activity.isCritical) {
                color = '#ef4444'; // Red for critical
            } else if (activity.progress === 100) {
                color = '#10b981'; // Green for completed
            } else if (activity.progress > 0) {
                color = '#f59e0b'; // Orange for in-progress
            } else {
                // Color by activity type
                const typeColors: { [key: string]: string } = {
                    'excavation': '#8b5cf6',
                    'concrete': '#64748b',
                    'reinforcement': '#f97316',
                    'waterproofing': '#06b6d4',
                    'backfill': '#84cc16',
                    'painting': '#ec4899',
                    'formwork': '#eab308',
                    'masonry': '#d97706',
                    'installation': '#0ea5e9',
                    'supply': '#6366f1',
                };
                color = typeColors[activity.type] || color;
            }
            
            return {
                activity,
                startPos: Math.max(0, startPos),
                width: Math.min(100 - startPos, width),
                color,
                row: index
            };
        });
    }, [filteredActivities, projectStart, projectEnd]);

    // Export to image
    const handleExport = () => {
        alert('تصدير الصورة قيد التطوير');
        // TODO: Implement image export using html2canvas
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                    <div>
                        <h2 className="text-2xl font-bold">مخطط جانت - {projectName}</h2>
                        <p className="text-sm text-gray-500">
                            {projectStart.toLocaleDateString('ar-SA')} - {projectEnd.toLocaleDateString('ar-SA')}
                        </p>
                    </div>
                </div>
                
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    <Download className="w-4 h-4" />
                    تصدير صورة
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                {/* View Mode */}
                <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <label className="text-sm font-medium">العرض:</label>
                    <select
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value as ViewMode)}
                        className="px-3 py-1 border rounded-lg dark:bg-slate-700"
                    >
                        <option value="days">أيام</option>
                        <option value="weeks">أسابيع</option>
                        <option value="months">أشهر</option>
                    </select>
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <label className="text-sm font-medium">الفئة:</label>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-3 py-1 border rounded-lg dark:bg-slate-700"
                    >
                        <option value="all">الكل</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Critical Only */}
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showCriticalOnly}
                        onChange={(e) => setShowCriticalOnly(e.target.checked)}
                        className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">الأنشطة الحرجة فقط</span>
                </label>

                {/* Stats */}
                <div className="mr-auto text-sm text-gray-600">
                    عرض {filteredActivities.length} من {activities.length} نشاط
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm">حرج</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm">مكتمل</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span className="text-sm">قيد التنفيذ</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-sm">مخطط</span>
                </div>
            </div>

            {/* Gantt Chart */}
            <div className="overflow-x-auto border rounded-lg">
                <div className="min-w-[1200px]">
                    {/* Timeline Header */}
                    <div className="flex border-b bg-gray-100 dark:bg-slate-800">
                        <div className="w-64 p-3 border-l font-bold">النشاط</div>
                        <div className="flex-1 relative">
                            <div className="flex">
                                {timeline.intervals.map((date, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 p-2 border-l text-center text-sm font-medium"
                                        style={{ minWidth: '60px' }}
                                    >
                                        {timeline.intervalLabel(date)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Activities */}
                    {ganttBars.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            لا توجد أنشطة تطابق الفلتر
                        </div>
                    ) : (
                        ganttBars.map((bar, index) => (
                            <div
                                key={index}
                                className="flex border-b hover:bg-gray-50 dark:hover:bg-slate-800/50"
                            >
                                {/* Activity Name */}
                                <div className="w-64 p-3 border-l">
                                    <div className="flex items-center gap-2">
                                        {bar.activity.isCritical && (
                                            <span className="text-red-500 font-bold">⚠️</span>
                                        )}
                                        <span className="text-sm truncate" title={bar.activity.name}>
                                            {bar.activity.name}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {bar.activity.duration} يوم | {bar.activity.progress}%
                                    </div>
                                </div>

                                {/* Gantt Bar */}
                                <div className="flex-1 relative p-2">
                                    <div
                                        className="absolute top-2 h-8 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                                        style={{
                                            right: `${bar.startPos}%`,
                                            width: `${bar.width}%`,
                                            backgroundColor: bar.color,
                                            minWidth: '4px'
                                        }}
                                        title={`${bar.activity.name}\n${bar.activity.startDate.toLocaleDateString('ar-SA')} - ${bar.activity.endDate.toLocaleDateString('ar-SA')}`}
                                    >
                                        {/* Progress Indicator */}
                                        {bar.activity.progress > 0 && (
                                            <div
                                                className="h-full bg-black/20 rounded-lg"
                                                style={{ width: `${bar.activity.progress}%` }}
                                            ></div>
                                        )}
                                        
                                        {/* Activity Label (if wide enough) */}
                                        {bar.width > 5 && (
                                            <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium px-2">
                                                {bar.activity.progress}%
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Summary */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">إجمالي الأنشطة:</span>
                        <span className="font-bold mr-2">{activities.length}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">الأنشطة الحرجة:</span>
                        <span className="font-bold mr-2 text-red-600">
                            {activities.filter(a => a.isCritical).length}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-500">المكتملة:</span>
                        <span className="font-bold mr-2 text-green-600">
                            {activities.filter(a => a.progress === 100).length}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-500">قيد التنفيذ:</span>
                        <span className="font-bold mr-2 text-orange-600">
                            {activities.filter(a => a.progress > 0 && a.progress < 100).length}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GanttChartViewer;
