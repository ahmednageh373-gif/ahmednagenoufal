import React from 'react';
import { Ruler, Box, Layers, Save, FileText, Star } from 'lucide-react';

interface CADStudioProps {
    projectId: string;
    projectName: string;
}

export const CADStudio: React.FC<CADStudioProps> = ({ projectId, projectName }) => {
    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 text-white p-6">
                <div className="flex items-center gap-3">
                    <Ruler className="w-8 h-8" />
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold">استوديو CAD v2.5 Pro</h1>
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        </div>
                        <p className="text-blue-100">قوالب معمارية جاهزة • رسم تلقائي • BricsCAD Integration • تصدير PDF</p>
                    </div>
                </div>
            </div>

            {/* Quick Templates Banner */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-4 border-b border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                        <span className="font-semibold text-gray-900 dark:text-white">قوالب جاهزة:</span>
                    </div>
                    <div className="flex gap-2 text-sm">
                        <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full border border-yellow-300 dark:border-yellow-700 text-gray-700 dark:text-gray-300">
                            🏠 فيلا 150م²
                        </span>
                        <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full border border-yellow-300 dark:border-yellow-700 text-gray-700 dark:text-gray-300">
                            🏡 فيلا 200م²
                        </span>
                        <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full border border-yellow-300 dark:border-yellow-700 text-gray-700 dark:text-gray-300">
                            🏘️ شقة 3 غرف
                        </span>
                    </div>
                </div>
            </div>

            {/* Features Cards */}
            <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-800/20 p-4 rounded-lg border-2 border-yellow-400 dark:border-yellow-600">
                        <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">قوالب معمارية جاهزة</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">3 قوالب فلل وشقق</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                        <div className="flex items-center gap-3">
                            <Ruler className="w-6 h-6 text-green-600 dark:text-green-400" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">حساب المساحات</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">تلقائي ودقيق بالمتر المربع</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                        <div className="flex items-center gap-3">
                            <Layers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">رموز معمارية كاملة</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">أبواب، شبابيك، أثاث</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center gap-3">
                            <Box className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">BricsCAD Integration</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">رفع ملفات DWG مباشرة</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Usage Guide */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">📐 كيفية الاستخدام - البداية السريعة</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">1️⃣</span>
                            <span className="font-semibold text-gray-900 dark:text-white">اختر قالب</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                            افتح القوالب المعمارية واختر (فيلا 150م² أو 200م² أو شقة 3 غرف)
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">2️⃣</span>
                            <span className="font-semibold text-gray-900 dark:text-white">أضف الرموز</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                            اسحب الأبواب والشبابيك والأثاث من المكتبة وأفلتها على المخطط
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">3️⃣</span>
                            <span className="font-semibold text-gray-900 dark:text-white">احفظ وصدّر</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                            احفظ المشروع (JSON) أو صدّره (PDF) أو ارفع من BricsCAD (DWG)
                        </p>
                    </div>
                </div>
            </div>

            {/* CAD Studio v2.5 Pro iframe */}
            <div className="flex-1 relative">
                <iframe
                    src="/cad-studio-v2.5-pro.html"
                    className="w-full h-full border-0"
                    title="استوديو CAD v2.5 Pro - محرك الرسم الهندسي المتكامل مع قوالب جاهزة"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
                />
            </div>
        </div>
    );
};

export default CADStudio;
