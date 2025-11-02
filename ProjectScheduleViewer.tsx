import React, { useState, useMemo } from 'react';
import { Project, ScheduleTask, FinancialItem } from './types';
import { Calendar, Clock, CheckCircle, Circle, AlertCircle, Download, Upload, Filter, Search, FileText, Wand2, Eye } from 'lucide-react';

interface Props {
    project: Project;
    onUpdateSchedule: (schedule: ScheduleTask[]) => void;
}

const ProjectScheduleViewer: React.FC<Props> = ({ project, onUpdateSchedule }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(50);
    const [importing, setImporting] = useState(false);
    const [showBOQModal, setShowBOQModal] = useState(false);
    const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
    const [previewTasks, setPreviewTasks] = useState<ScheduleTask[]>([]);
    const [showPreview, setShowPreview] = useState(false);

    // إحصائيات
    const stats = useMemo(() => {
        const total = project.data.schedule.length;
        const completed = project.data.schedule.filter(t => t.status === 'Done').length;
        const inProgress = project.data.schedule.filter(t => t.status === 'In Progress').length;
        const todo = project.data.schedule.filter(t => t.status === 'To Do').length;
        const avgProgress = total > 0 
            ? project.data.schedule.reduce((sum, t) => sum + (t.progress || 0), 0) / total 
            : 0;

        return { total, completed, inProgress, todo, avgProgress: Math.round(avgProgress) };
    }, [project.data.schedule]);

    // الفئات المتاحة
    const availableCategories = useMemo(() => {
        const categories = new Set(project.data.schedule.map(t => t.category || 'غير محدد'));
        return Array.from(categories).sort();
    }, [project.data.schedule]);

    // تصفية المهام
    const filteredTasks = useMemo(() => {
        return project.data.schedule.filter(task => {
            const matchesSearch = !searchTerm || 
                task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (task.wbsCode && task.wbsCode.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
            const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [project.data.schedule, searchTerm, categoryFilter, statusFilter]);

    // التصفح
    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
    const paginatedTasks = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredTasks.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredTasks, currentPage, itemsPerPage]);

    // حساب مدة المهمة بالأيام
    const calculateDuration = (start: string, end: string): number => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // تصدير JSON
    const handleExport = () => {
        const dataStr = JSON.stringify(project.data.schedule, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `schedule_${project.name}_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // استيراد JSON
    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImporting(true);
        try {
            const text = await file.text();
            const importedSchedule = JSON.parse(text) as ScheduleTask[];
            
            if (!Array.isArray(importedSchedule)) {
                throw new Error('الملف لا يحتوي على مصفوفة صالحة');
            }

            onUpdateSchedule(importedSchedule);
            alert(`✅ تم استيراد ${importedSchedule.length} مهمة بنجاح!`);
        } catch (error) {
            alert('❌ فشل في استيراد الملف: ' + (error as Error).message);
        } finally {
            setImporting(false);
        }
    };

    // بيانات تجريبية للمعاينة
    const createSampleData = (): FinancialItem[] => {
        return [
            { item: 'الرمل', quantity: 100, unit: 'م3', unitPrice: 50, totalPrice: 5000, code: 'SAND', itemNumber: '001', category: 'مواد إنشائية' },
            { item: 'الأسمنت', quantity: 200, unit: 'كيس', unitPrice: 25, totalPrice: 5000, code: 'CEME', itemNumber: '002', category: 'مواد إنشائية' },
            { item: 'الحديد', quantity: 50, unit: 'طن', unitPrice: 2000, totalPrice: 100000, code: 'STEE', itemNumber: '003', category: 'مواد إنشائية' },
            { item: 'البلاط', quantity: 300, unit: 'م2', unitPrice: 80, totalPrice: 24000, code: 'TILE', itemNumber: '004', category: 'تشطيبات' },
            { item: 'الدهان', quantity: 500, unit: 'م2', unitPrice: 15, totalPrice: 7500, code: 'PAIN', itemNumber: '005', category: 'تشطيبات' }
        ];
    };

    // دالة إنشاء المعاينة
    const generatePreview = () => {
        console.log('🔄 بدء إنشاء المعاينة...');
        console.log('📊 عدد بنود المقايسة:', project.data.financials.length);

        // إذا كانت المقايسة فارغة، استخدم بيانات تجريبية
        const boqItems = project.data.financials.length > 0 
            ? project.data.financials 
            : createSampleData();

        console.log('✅ البيانات المستخدمة:', boqItems.length, 'بند');

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

        boqItems.forEach((boqItem, index) => {
            const itemCode = boqItem.code || boqItem.itemNumber || `ITEM-${String(index + 1).padStart(3, '0')}`;
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

        console.log('✅ تم إنشاء', generatedTasks.length, 'مهمة');
        
        setPreviewTasks(generatedTasks);
        setShowBOQModal(false);
        setShowPreview(true);
        
        console.log('✅ تم فتح نافذة المعاينة');
    };

    // دالة تأكيد الإنشاء
    const confirmGeneration = () => {
        console.log('✅ تأكيد الإنشاء...');
        setIsGeneratingSchedule(true);
        
        try {
            onUpdateSchedule(previewTasks);
            setShowPreview(false);
            
            const message = project.data.financials.length > 0
                ? `✅ تم إنشاء ${previewTasks.length} مهمة من ${project.data.financials.length} بند في المقايسة!`
                : `✅ تم إنشاء ${previewTasks.length} مهمة تجريبية! (لا توجد بنود في المقايسة)`;
            
            alert(message);
        } catch (error) {
            alert('❌ فشل في إنشاء الجدول الزمني: ' + (error as Error).message);
        } finally {
            setIsGeneratingSchedule(false);
        }
    };

    // أيقونة الحالة
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Done':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'In Progress':
                return <Clock className="w-4 h-4 text-blue-600" />;
            case 'To Do':
                return <Circle className="w-4 h-4 text-gray-400" />;
            default:
                return <AlertCircle className="w-4 h-4 text-yellow-600" />;
        }
    };

    // لون الأولوية
    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'High':
                return 'text-red-600 bg-red-50';
            case 'Medium':
                return 'text-yellow-600 bg-yellow-50';
            case 'Low':
                return 'text-green-600 bg-green-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="space-y-6">
            {/* العنوان والأزرار */}
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
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                        title="إنشاء الجدول الزمني من بنود المقايسة"
                    >
                        <Wand2 className="w-4 h-4" />
                        إنشاء من المقايسة
                    </button>

                    {/* زر الاستيراد */}
                    <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer flex items-center gap-2 shadow-md hover:shadow-lg transition-all">
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
                    <div className="text-2xl font-bold">{stats.total}</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg shadow">
                    <div className="text-sm text-green-600 dark:text-green-400">المكتملة</div>
                    <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg shadow">
                    <div className="text-sm text-blue-600 dark:text-blue-400">قيد التنفيذ</div>
                    <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-600 dark:text-gray-400">لم تبدأ</div>
                    <div className="text-2xl font-bold text-gray-600">{stats.todo}</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg shadow">
                    <div className="text-sm text-purple-600 dark:text-purple-400">متوسط التقدم</div>
                    <div className="text-2xl font-bold text-purple-600">{stats.avgProgress}%</div>
                </div>
            </div>

            {/* أدوات البحث والتصفية */}
            {project.data.schedule.length > 0 && (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* البحث */}
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="البحث في المهام (الاسم أو WBS)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700"
                            />
                        </div>

                        {/* تصفية الفئة */}
                        <div className="relative">
                            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full pr-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700"
                            >
                                <option value="all">جميع الفئات</option>
                                {availableCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* تصفية الحالة */}
                        <div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700"
                            >
                                <option value="all">جميع الحالات</option>
                                <option value="To Do">لم تبدأ</option>
                                <option value="In Progress">قيد التنفيذ</option>
                                <option value="Done">مكتملة</option>
                            </select>
                        </div>
                    </div>

                    {/* عدد النتائج */}
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        عرض {paginatedTasks.length} من {filteredTasks.length} مهمة
                        {filteredTasks.length !== stats.total && ` (من إجمالي ${stats.total})`}
                    </div>
                </div>
            )}

            {/* رسالة إذا لم توجد مهام */}
            {project.data.schedule.length === 0 && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-8 rounded-xl border-2 border-yellow-200 dark:border-yellow-800 text-center shadow-lg">
                    <div className="inline-block p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4">
                        <AlertCircle className="w-16 h-16 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-yellow-800 dark:text-yellow-300 mb-3">
                        لا يوجد جدول زمني حالياً
                    </h3>
                    <p className="text-yellow-700 dark:text-yellow-400 mb-6 text-lg">
                        يمكنك إنشاء جدول زمني تلقائياً من بنود المقايسة أو استيراد جدول موجود
                    </p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <button
                            onClick={() => setShowBOQModal(true)}
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all text-lg font-semibold"
                        >
                            <Wand2 className="w-5 h-5" />
                            إنشاء من المقايسة
                        </button>
                        <label className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer flex items-center gap-2 shadow-lg hover:shadow-xl transition-all text-lg font-semibold">
                            <Upload className="w-5 h-5" />
                            استيراد ملف
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
            )}

            {/* جدول المهام */}
            {project.data.schedule.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-slate-700">
                                <tr>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">WBS</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">اسم المهمة</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">تاريخ البدء</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">تاريخ الانتهاء</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">المدة</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">التقدم</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الحالة</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الأولوية</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الفئة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {paginatedTasks.map((task) => (
                                    <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                        <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100">
                                            {task.wbsCode || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            {task.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {task.start}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {task.end}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {calculateDuration(task.start, task.end)} يوم
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full transition-all"
                                                        style={{ width: `${task.progress || 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-600 dark:text-gray-400 w-10 text-left">
                                                    {task.progress || 0}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                {getStatusIcon(task.status)}
                                                <span className="text-sm">{task.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                                                {task.priority || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {task.category || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* التصفح */}
                    {totalPages > 1 && (
                        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                صفحة {currentPage} من {totalPages}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
                                >
                                    السابق
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
                                >
                                    التالي
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* زر التصدير */}
            {project.data.schedule.length > 0 && (
                <div className="flex justify-end">
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        تصدير JSON ({project.data.schedule.length} مهمة)
                    </button>
                </div>
            )}

            {/* نافذة إنشاء الجدول من المقايسة */}
            {showBOQModal && !showPreview && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={() => setShowBOQModal(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 animate-slideUp" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Wand2 className="w-6 h-6 text-purple-600" />
                                إنشاء الجدول الزمني من المقايسة
                            </h3>
                            <button
                                onClick={() => setShowBOQModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-3xl leading-none hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* معلومات المقايسة */}
                            <div className="bg-blue-50 dark:bg-slate-700 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    <span className="font-semibold text-lg">بيانات المقايسة الحالية</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded">
                                        <span className="text-gray-600 dark:text-gray-400 block mb-1">عدد البنود:</span>
                                        <span className="font-bold text-xl text-blue-600">
                                            {project.data.financials.length || 0}
                                            {project.data.financials.length === 0 && ' (سيتم استخدام بيانات تجريبية)'}
                                        </span>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded">
                                        <span className="text-gray-600 dark:text-gray-400 block mb-1">الأنشطة المتوقعة:</span>
                                        <span className="font-bold text-xl text-purple-600">
                                            {(project.data.financials.length || 5) * 5}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* تنبيه للبيانات التجريبية */}
                            {project.data.financials.length === 0 && (
                                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm">
                                            <strong className="text-orange-800 dark:text-orange-300">ملاحظة:</strong>
                                            <p className="text-orange-700 dark:text-orange-400 mt-1">
                                                لا توجد بنود في المقايسة. سيتم استخدام <strong>5 بنود تجريبية</strong> للمعاينة.
                                                لإنشاء جدول فعلي، الرجاء إضافة بنود في صفحة <strong>"إدارة المقايسة"</strong> أولاً.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* شرح المنهجية */}
                            <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                <h4 className="font-semibold mb-3 text-lg">منهجية الإنشاء (5 مراحل قياسية):</h4>
                                <div className="space-y-2 text-sm">
                                    {[
                                        { num: 1, phase: 'PR - طلب تقديم عينة/كتالوج', days: 3 },
                                        { num: 2, phase: 'PO - تأمين عينة/كتالوج', days: 3 },
                                        { num: 3, phase: 'MS - تقديم للاعتماد', days: 3 },
                                        { num: 4, phase: 'MA - اعتماد', days: 3 },
                                        { num: 5, phase: 'MIR - وصول المواد', days: 21 }
                                    ].map(({ num, phase, days }) => (
                                        <div key={num} className="flex items-start gap-2">
                                            <div className="w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                                                {num}
                                            </div>
                                            <div className="flex-1">
                                                <strong className="text-base">{phase}</strong>
                                                <span className="text-gray-600 dark:text-gray-400 mr-2 font-semibold">({days} أيام)</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* تحذير عند وجود جدول */}
                            {project.data.schedule.length > 0 && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm">
                                            <strong className="text-yellow-800 dark:text-yellow-300">تحذير:</strong>
                                            <p className="text-yellow-700 dark:text-yellow-400 mt-1">
                                                يوجد حالياً <strong>{project.data.schedule.length} مهمة</strong> في الجدول الزمني.
                                                سيتم استبدالها بالكامل بالجدول الجديد عند التأكيد.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* أزرار الإجراءات */}
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setShowBOQModal(false)}
                                className="px-6 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 font-semibold transition-all"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={generatePreview}
                                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all font-semibold"
                            >
                                <Eye className="w-4 h-4" />
                                معاينة الجدول
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* نافذة المعاينة */}
            {showPreview && previewTasks.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={() => setShowPreview(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slideUp" onClick={(e) => e.stopPropagation()}>
                        {/* رأس النافذة */}
                        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                            <h3 className="text-2xl font-bold flex items-center gap-3">
                                <div className="p-2 bg-purple-600 rounded-lg">
                                    <Eye className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <div>معاينة الجدول الزمني</div>
                                    <div className="text-sm font-normal text-gray-600 dark:text-gray-400">
                                        {previewTasks.length} مهمة · {Math.ceil(previewTasks.length / 5)} بند
                                    </div>
                                </div>
                            </h3>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="text-gray-500 hover:text-gray-700 text-3xl leading-none hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full w-10 h-10 flex items-center justify-center transition-all"
                            >
                                ×
                            </button>
                        </div>

                        {/* المحتوى */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-slate-900">
                            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">#</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">WBS</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">اسم المهمة</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">البدء</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">الانتهاء</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">المدة</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">الفئة</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {previewTasks.slice(0, 100).map((task, index) => (
                                                <tr key={task.id} className="hover:bg-purple-50 dark:hover:bg-slate-700/50 transition-colors">
                                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-semibold">{index + 1}</td>
                                                    <td className="px-4 py-3 text-xs font-mono text-blue-600 dark:text-blue-400 font-semibold">{task.wbsCode}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-medium">{task.name}</td>
                                                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{task.start}</td>
                                                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{task.end}</td>
                                                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 font-semibold">
                                                        {calculateDuration(task.start, task.end)} يوم
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-medium">
                                                            {task.category}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {previewTasks.length > 100 && (
                                        <div className="text-center py-6 bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-gray-700">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                ... وعرض <strong className="text-purple-600">{previewTasks.length - 100}</strong> مهمة إضافية
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* تذييل النافذة */}
                        <div className="p-6 border-t-2 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-purple-600">{Math.ceil(previewTasks.length / 5)}</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">بند</div>
                                    </div>
                                    <div className="text-2xl text-gray-400">→</div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-blue-600">{previewTasks.length}</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">مهمة</div>
                                    </div>
                                    <div className="text-2xl text-gray-400">×</div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-green-600">5</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">مراحل</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-white dark:hover:bg-slate-700 font-semibold transition-all text-lg"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={confirmGeneration}
                                    disabled={isGeneratingSchedule}
                                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all text-lg font-semibold"
                                >
                                    {isGeneratingSchedule ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                            جاري الإنشاء...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            تأكيد الإنشاء
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectScheduleViewer;
