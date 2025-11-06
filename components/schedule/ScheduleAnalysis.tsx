import React, { useState, useMemo } from 'react';
import { Calendar, LayoutGrid, BarChart3, Filter, Download, Search } from 'lucide-react';
import type { Project } from '../../types';

interface ScheduleAnalysisProps {
    project: Project;
}

type ViewMode = 'gantt' | 'table' | 'calendar';
type TaskStatus = 'not-started' | 'in-progress' | 'completed' | 'overdue';

interface Task {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    duration: number;
    progress: number;
    status: TaskStatus;
    priority: 'low' | 'medium' | 'high';
    assignedTo: string;
    dependencies: string[];
    isCritical: boolean;
}

export const ScheduleAnalysis: React.FC<ScheduleAnalysisProps> = ({ project }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('gantt');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // Mock data - in production, use project.data.schedule
    const tasks: Task[] = useMemo(() => {
        const now = new Date();
        return [
            {
                id: 'task-1',
                name: 'أعمال الحفر والتسوية',
                startDate: new Date(now.getTime()),
                endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
                duration: 7,
                progress: 100,
                status: 'completed' as TaskStatus,
                priority: 'high',
                assignedTo: 'فريق الحفر',
                dependencies: [],
                isCritical: true
            },
            {
                id: 'task-2',
                name: 'أعمال الخرسانة المسلحة - القواعد',
                startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
                endDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
                duration: 14,
                progress: 65,
                status: 'in-progress' as TaskStatus,
                priority: 'high',
                assignedTo: 'فريق الخرسانة',
                dependencies: ['task-1'],
                isCritical: true
            },
            {
                id: 'task-3',
                name: 'أعمال البناء - الجدران',
                startDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
                endDate: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000),
                duration: 14,
                progress: 0,
                status: 'not-started' as TaskStatus,
                priority: 'medium',
                assignedTo: 'فريق البناء',
                dependencies: ['task-2'],
                isCritical: false
            },
            {
                id: 'task-4',
                name: 'أعمال التشطيبات الداخلية',
                startDate: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000),
                endDate: new Date(now.getTime() + 56 * 24 * 60 * 60 * 1000),
                duration: 21,
                progress: 0,
                status: 'not-started' as TaskStatus,
                priority: 'medium',
                assignedTo: 'فريق التشطيبات',
                dependencies: ['task-3'],
                isCritical: false
            }
        ];
    }, []);

    // Filter tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [tasks, searchQuery, filterStatus]);

    // Statistics
    const stats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const inProgress = tasks.filter(t => t.status === 'in-progress').length;
        const overdue = tasks.filter(t => t.status === 'overdue').length;
        const avgProgress = tasks.reduce((sum, t) => sum + t.progress, 0) / total;

        return { total, completed, inProgress, overdue, avgProgress: Math.round(avgProgress) };
    }, [tasks]);

    const getStatusColor = (status: TaskStatus) => {
        switch (status) {
            case 'completed': return 'bg-green-500';
            case 'in-progress': return 'bg-blue-500';
            case 'not-started': return 'bg-gray-400';
            case 'overdue': return 'bg-red-500';
            default: return 'bg-gray-400';
        }
    };

    const getStatusText = (status: TaskStatus) => {
        switch (status) {
            case 'completed': return 'مكتمل';
            case 'in-progress': return 'قيد التنفيذ';
            case 'not-started': return 'لم يبدأ';
            case 'overdue': return 'متأخر';
            default: return status;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
                        <BarChart3 className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">تحليل الجدول الزمني</h1>
                        <p className="text-gray-600 dark:text-gray-400">مخطط جانت تفاعلي مع تحليل المسار الحرج</p>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">التقدم الإجمالي</p>
                            <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.avgProgress}%</p>
                        </div>
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-lg">
                            <BarChart3 className="text-indigo-600 dark:text-indigo-400" size={24} />
                        </div>
                    </div>
                    <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${stats.avgProgress}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">المهام المكتملة</p>
                            <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.completed}</p>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">المهام المتأخرة</p>
                            <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.overdue}</p>
                        </div>
                        <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">إجمالي المهام</p>
                            <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    {/* View Toggle */}
                    <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('gantt')}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                                viewMode === 'gantt'
                                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-md'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            <LayoutGrid size={18} />
                            <span className="hidden sm:inline">جانت</span>
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                                viewMode === 'table'
                                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-md'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            <BarChart3 size={18} />
                            <span className="hidden sm:inline">جدول</span>
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                                viewMode === 'calendar'
                                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-md'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            <Calendar size={18} />
                            <span className="hidden sm:inline">تقويم</span>
                        </button>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-64">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="بحث في المهام..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="all">جميع الحالات</option>
                            <option value="completed">مكتمل</option>
                            <option value="in-progress">قيد التنفيذ</option>
                            <option value="not-started">لم يبدأ</option>
                            <option value="overdue">متأخر</option>
                        </select>
                    </div>

                    <button className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2">
                        <Download size={18} />
                        <span>تصدير</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                {viewMode === 'table' && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">اسم المهمة</th>
                                    <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">الحالة</th>
                                    <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">التقدم</th>
                                    <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">المدة</th>
                                    <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">المسؤول</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTasks.map(task => (
                                    <tr key={task.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                {task.isCritical && (
                                                    <span className="w-2 h-2 bg-orange-500 rounded-full" title="مهمة حرجة"></span>
                                                )}
                                                <span className="text-gray-800 dark:text-gray-200">{task.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)} text-white`}>
                                                {getStatusText(task.status)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div 
                                                        className={`h-2 rounded-full ${getStatusColor(task.status)}`}
                                                        style={{ width: `${task.progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-left">{task.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{task.duration} يوم</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{task.assignedTo}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {viewMode === 'gantt' && (
                    <div className="text-center py-12">
                        <LayoutGrid size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">مخطط جانت التفاعلي</p>
                        <p className="text-gray-500 dark:text-gray-500 text-sm">سيتم تفعيله قريباً مع تحليل المسار الحرج</p>
                    </div>
                )}

                {viewMode === 'calendar' && (
                    <div className="text-center py-12">
                        <Calendar size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">عرض التقويم</p>
                        <p className="text-gray-500 dark:text-gray-500 text-sm">سيتم تفعيله قريباً</p>
                    </div>
                )}
            </div>
        </div>
    );
};
