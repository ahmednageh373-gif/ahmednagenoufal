import React from 'react';
import { Box, FileText, Calendar } from 'lucide-react';

interface Viewer4DProps {
    projectId: string;
    projectName: string;
}

export const Viewer4D: React.FC<Viewer4DProps> = ({ projectId, projectName }) => {
    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                <div className="flex items-center gap-3">
                    <Box className="w-8 h-8" />
                    <div>
                        <h1 className="text-2xl font-bold">عارض 4D المتكامل</h1>
                        <p className="text-indigo-100">المقايسة • الجدول الزمني • العرض ثلاثي الأبعاد</p>
                    </div>
                </div>
            </div>

            {/* Info Cards */}
            <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">رفع المقايسة</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Excel أو CSV</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                        <div className="flex items-center gap-3">
                            <Box className="w-6 h-6 text-green-600 dark:text-green-400" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">نموذج IFC</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Building Information Model</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">الجدول الزمني</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">XML أو XER أو توليد تلقائي</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features List */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">✨ الميزات</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                        <span>استخراج الكميات من Excel</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                        <span>توليد جدول تلقائي</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                        <span>عرض 3D تفاعلي</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                        <span>محاكاة زمنية 4D</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        <span>دعم Primavera P6</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        <span>دعم MS Project</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        <span>Play تلقائي</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        <span>إحصائيات مباشرة</span>
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">📋 خطوات الاستخدام</h3>
                <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                        <span><strong>رفع ملف المقايسة:</strong> اختر ملف Excel (.xlsx) أو CSV يحتوي على الكميات (ItemName, Unit, Quantity)</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                        <span><strong>رفع نموذج IFC:</strong> اختر ملف .ifc للمبنى أو المشروع</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                        <span><strong>الجدول الزمني:</strong> إما رفع ملف جدول (XML/XER) أو توليد جدول تلقائي من المقایسة</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                        <span><strong>التحكم بالعرض:</strong> استخدم شريط الوقت أو زر Play لمشاهدة تطور المشروع</span>
                    </li>
                </ol>
            </div>

            {/* 4D Viewer iframe */}
            <div className="flex-1 relative">
                <iframe
                    src="/4d-full.html"
                    className="w-full h-full border-0"
                    title="عارض 4D المتكامل"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                />
            </div>
        </div>
    );
};

export default Viewer4D;
