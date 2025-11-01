import React, { useState, useMemo } from 'react';
import { Project, ScheduleTask, FinancialItem } from './types';
import { Calendar, Clock, CheckCircle, Circle, AlertCircle, Download, Upload, Filter, Search, FileText, Wand2 } from 'lucide-react';

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
    const [showBOQModal, setShowBOQModal] = useState(false);
    const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);

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

    // دالة إنشاء الجدول الزمني من المقايسة
    const generateScheduleFromBOQ = () => {
        if (project.data.financials.length === 0) {
            alert('❌ لا توجد بنود في المقايسة. الرجاء إضافة بنود أولاً.');
            return;
        }

        setIsGeneratingSchedule(true);
        
        try {
            const generatedTasks: ScheduleTask[] = [];
            let taskIdCounter = 1;
            const startDate = new Date();

            // المراحل القياسية لكل بند
            const standardPhases = [
                { code: 'PR', name: 'طلب تقديم عينة/كتالوج (PR)', duration: 3 },
                { code: 'PO', name: 'تأمين عينة/كتالوج (PO)', duration: 3 },
                { code: 'MS', name: 'تقديم للاعتماد (MS)', duration: 3 },
                { code: 'MA', name: 'اعتماد (MA)', duration: 3 },
                { code: 'MIR', name: 'وصول المواد (MIR)', duration: 21 }
            ];

            project.data.financials.forEach((boqItem, index) => {
                // إنشاء كود WBS للبند
                const itemCode = boqItem.code || boqItem.itemNumber || `ITEM-${index + 1}`;
                const category = boqItem.category || 'عام';
                
                let currentStart = new Date(startDate);

                standardPhases.forEach((phase, phaseIndex) => {
                    const currentEnd = new Date(currentStart);
                    currentEnd.setDate(currentEnd.getDate() + phase.duration);

                    const task: ScheduleTask = {
                        id: taskIdCounter++,
                        wbsCode: `${itemCode}-${phase.code}-${(phaseIndex + 1) * 10}`,
                        name: `${phase.name} - ${boqItem.item}`,
                        start: currentStart.toISOString().split('T')[0],
                        end: currentEnd.toISOString().split('T')[0],
                        progress: 0,
                        dependencies: phaseIndex > 0 ? [taskIdCounter - 2] : [],
                        category: category,
                        status: 'To Do',
                        priority: 'Medium'
                    };

                    generatedTasks.push(task);
                    currentStart = new Date(currentEnd);
                    currentStart.setDate(currentStart.getDate() + 1);
                });
            });

            onUpdateSchedule(generatedTasks);
            setShowBOQModal(false);
            alert(`✅ تم إنشاء ${generatedTasks.length} مهمة من ${project.data.financials.length} بند في المقايسة!`);
        } catch (error) {
            alert('❌ فشل في إنشاء الجدول الزمني: ' + (error as Error).message);
        } finally {
            setIsGeneratingSchedule(false);
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
                
                {/* أزرار الإجراءات */}
                <div className="flex items-center gap-3">
                    {/* زر إنشاء من المقايسة */}
                    <button
                        onClick={() => setShowBOQModal(true)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                        title="إنشاء الجدول الزمني من بنود المقايسة"
                    >
                        <Wand2 className="w-4 h-4" />
                        إنشاء من المقايسة
                    </button>

                    {/* زر الاستيراد */}
                    <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        استيراد JSON
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="hidden"
                            disabled={importing}
                        />
                    </label>
                </div>
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

            {/* نافذة إنشاء الجدول من المقايسة */}
            {showBOQModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowBOQModal(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Wand2 className="w-6 h-6 text-purple-600" />
                                إنشاء الجدول الزمني من المقايسة
                            </h3>
                            <button
                                onClick={() => setShowBOQModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* معلومات المقايسة */}
                            <div className="bg-blue-50 dark:bg-slate-700 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    <span className="font-semibold">بيانات المقايسة الحالية</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">عدد البنود:</span>
                                        <span className="font-bold mr-2">{project.data.financials.length}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">الأنشطة المتوقعة:</span>
                                        <span className="font-bold mr-2">{project.data.financials.length * 5}</span>
                                    </div>
                                </div>
                            </div>

                            {/* شرح المنهجية */}
                            <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                                <h4 className="font-semibold mb-3">منهجية الإنشاء:</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-start gap-2">
                                        <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs">1</div>
                                        <div>
                                            <strong>PR - طلب تقديم عينة/كتالوج</strong>
                                            <span className="text-gray-600 dark:text-gray-400 mr-2">(3 أيام)</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs">2</div>
                                        <div>
                                            <strong>PO - تأمين عينة/كتالوج</strong>
                                            <span className="text-gray-600 dark:text-gray-400 mr-2">(3 أيام)</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs">3</div>
                                        <div>
                                            <strong>MS - تقديم للاعتماد</strong>
                                            <span className="text-gray-600 dark:text-gray-400 mr-2">(3 أيام)</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs">4</div>
                                        <div>
                                            <strong>MA - اعتماد</strong>
                                            <span className="text-gray-600 dark:text-gray-400 mr-2">(3 أيام)</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs">5</div>
                                        <div>
                                            <strong>MIR - وصول المواد</strong>
                                            <span className="text-gray-600 dark:text-gray-400 mr-2">(21 يوم)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* تحذير */}
                            {project.data.schedule.length > 0 && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm">
                                            <strong className="text-yellow-800 dark:text-yellow-300">تحذير:</strong>
                                            <p className="text-yellow-700 dark:text-yellow-400 mt-1">
                                                يوجد حالياً <strong>{project.data.schedule.length} مهمة</strong> في الجدول الزمني.
                                                سيتم استبدالها بالكامل بالجدول الجديد المنشأ من المقايسة.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* معلومة للمستخدم */}
                            {project.data.financials.length === 0 && (
                                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-red-700 dark:text-red-400">
                                            لا توجد بنود في المقايسة. الرجاء الانتقال إلى <strong>إدارة المقايسة</strong> وإضافة البنود أولاً.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* أزرار الإجراءات */}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowBOQModal(false)}
                                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={generateScheduleFromBOQ}
                                disabled={project.data.financials.length === 0 || isGeneratingSchedule}
                                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isGeneratingSchedule ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        جاري الإنشاء...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-4 h-4" />
                                        إنشاء الجدول الزمني
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectScheduleViewer;
