import React, { useState, useMemo } from 'react';
import { Project, ScheduleTask } from './types';
import { Calendar, Clock, CheckCircle, Circle, AlertCircle, Download, Upload, Filter, Search } from 'lucide-react';

interface Props {
    project: Project;
    onUpdateSchedule: (tasks: ScheduleTask[]) => void;
}

// استيراد بيانات الجدول الزمني من ملف JSON
const importScheduleFromJSON = async (file: File): Promise<ScheduleTask[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target?.result as string);
                const tasks: ScheduleTask[] = jsonData.map((item: any) => ({
                    id: item.id,
                    wbsCode: item.wbsCode || '',
                    name: item.name,
                    start: item.start,
                    end: item.end,
                    progress: item.progress || 0,
                    dependencies: item.dependencies || [],
                    category: item.category || 'عام',
                    status: item.status || 'To Do',
                    priority: item.priority || 'Medium'
                }));
                resolve(tasks);
            } catch (error) {
                reject(new Error('فشل في قراءة ملف JSON'));
            }
        };
        reader.onerror = () => reject(new Error('فشل في قراءة الملف'));
        reader.readAsText(file);
    });
};

const ProjectScheduleViewer: React.FC<Props> = ({ project, onUpdateSchedule }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(50);
    const [importing, setImporting] = useState(false);

    // إحصائيات
    const stats = useMemo(() => {
        const tasks = project.data.schedule;
        return {
            total: tasks.length,
            completed: tasks.filter(t => t.status === 'Done').length,
            inProgress: tasks.filter(t => t.status === 'In Progress').length,
            toDo: tasks.filter(t => t.status === 'To Do').length,
            avgProgress: tasks.length > 0 
                ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length)
                : 0
        };
    }, [project.data.schedule]);

    // تصفية وبحث
    const filteredTasks = useMemo(() => {
        let filtered = project.data.schedule;

        // بحث
        if (searchTerm) {
            filtered = filtered.filter(task =>
                task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (task.wbsCode && task.wbsCode.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // تصفية حسب الحالة
        if (filterStatus !== 'all') {
            filtered = filtered.filter(task => task.status === filterStatus);
        }

        // تصفية حسب الفئة
        if (filterCategory !== 'all') {
            filtered = filtered.filter(task => task.category === filterCategory);
        }

        return filtered;
    }, [project.data.schedule, searchTerm, filterStatus, filterCategory]);

    // الفئات الفريدة
    const categories = useMemo(() => {
        const cats = new Set(project.data.schedule.map(t => t.category).filter(Boolean));
        return Array.from(cats);
    }, [project.data.schedule]);

    // Pagination
    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
    const paginatedTasks = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredTasks.slice(start, start + itemsPerPage);
    }, [filteredTasks, currentPage, itemsPerPage]);

    // استيراد الجدول الزمني
    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        try {
            const tasks = await importScheduleFromJSON(file);
            onUpdateSchedule(tasks);
            alert(`✅ تم استيراد ${tasks.length} مهمة بنجاح!`);
        } catch (error) {
            alert('❌ فشل في استيراد الملف: ' + (error as Error).message);
        } finally {
            setImporting(false);
        }
    };

    // دالة لحساب لون التقدم
    const getProgressColor = (progress: number) => {
        if (progress >= 100) return 'bg-green-500';
        if (progress >= 75) return 'bg-blue-500';
        if (progress >= 50) return 'bg-yellow-500';
        if (progress >= 25) return 'bg-orange-500';
        return 'bg-red-500';
    };

    // أيقونة الحالة
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Done':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'In Progress':
                return <AlertCircle className="w-5 h-5 text-blue-600" />;
            default:
                return <Circle className="w-5 h-5 text-gray-400" />;
        }
    };

    return (
        <div className="p-6 space-y-6" dir="rtl">
            {/* العنوان */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Calendar className="w-7 h-7 text-blue-600" />
                    الجدول الزمني للمشروع
                </h2>
                
                {/* زر الاستيراد */}
                <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    استيراد جدول زمني
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                        disabled={importing}
                    />
                </label>
            </div>

            {/* الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-600 dark:text-gray-400">إجمالي المهام</div>
                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-600 dark:text-gray-400">مكتملة</div>
                    <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-600 dark:text-gray-400">قيد التنفيذ</div>
                    <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-600 dark:text-gray-400">لم تبدأ</div>
                    <div className="text-2xl font-bold text-gray-600">{stats.toDo}</div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-600 dark:text-gray-400">متوسط الإنجاز</div>
                    <div className="text-2xl font-bold text-purple-600">{stats.avgProgress}%</div>
                </div>
            </div>

            {/* أدوات البحث والتصفية */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* بحث */}
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="بحث في المهام..."
                            className="w-full pr-10 p-2 border rounded-lg dark:bg-slate-700"
                        />
                    </div>

                    {/* تصفية الحالة */}
                    <div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full p-2 border rounded-lg dark:bg-slate-700"
                        >
                            <option value="all">جميع الحالات</option>
                            <option value="To Do">لم تبدأ</option>
                            <option value="In Progress">قيد التنفيذ</option>
                            <option value="Done">مكتملة</option>
                        </select>
                    </div>

                    {/* تصفية الفئة */}
                    <div>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full p-2 border rounded-lg dark:bg-slate-700"
                        >
                            <option value="all">جميع الفئات</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                    عرض {paginatedTasks.length} من {filteredTasks.length} مهمة
                </div>
            </div>

            {/* جدول المهام */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700 sticky top-0">
                        <tr>
                            <th className="p-3 text-sm font-medium text-right">#</th>
                            <th className="p-3 text-sm font-medium text-right">رمز WBS</th>
                            <th className="p-3 text-sm font-medium text-right">اسم المهمة</th>
                            <th className="p-3 text-sm font-medium text-right">تاريخ البدء</th>
                            <th className="p-3 text-sm font-medium text-right">تاريخ الانتهاء</th>
                            <th className="p-3 text-sm font-medium text-right">المدة</th>
                            <th className="p-3 text-sm font-medium text-right">التقدم</th>
                            <th className="p-3 text-sm font-medium text-right">الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedTasks.map((task, index) => {
                            const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                            const duration = Math.ceil(
                                (new Date(task.end).getTime() - new Date(task.start).getTime()) / (1000 * 60 * 60 * 24)
                            );
                            
                            return (
                                <tr key={task.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="p-3 text-center text-sm text-gray-500">{globalIndex}</td>
                                    <td className="p-3 text-sm font-mono">{task.wbsCode || '-'}</td>
                                    <td className="p-3 text-sm">{task.name}</td>
                                    <td className="p-3 text-sm">{task.start}</td>
                                    <td className="p-3 text-sm">{task.end}</td>
                                    <td className="p-3 text-sm text-center">{duration} يوم</td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${getProgressColor(task.progress)}`}
                                                    style={{ width: `${task.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium w-12 text-left">{task.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(task.status)}
                                            <span className="text-sm">{task.status}</span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 border rounded-lg disabled:opacity-50"
                    >
                        «
                    </button>
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border rounded-lg disabled:opacity-50"
                    >
                        السابق
                    </button>
                    <span className="px-4 py-2">
                        صفحة {currentPage} من {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border rounded-lg disabled:opacity-50"
                    >
                        التالي
                    </button>
                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 border rounded-lg disabled:opacity-50"
                    >
                        »
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProjectScheduleViewer;
