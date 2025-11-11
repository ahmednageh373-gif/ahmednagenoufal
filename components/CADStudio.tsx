import React from 'react';
import { Ruler, Box, Layers, Save, FileText } from 'lucide-react';

interface CADStudioProps {
    projectId: string;
    projectName: string;
}

export const CADStudio: React.FC<CADStudioProps> = ({ projectId, projectName }) => {
    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
                <div className="flex items-center gap-3">
                    <Ruler className="w-8 h-8" />
                    <div>
                        <h1 className="text-2xl font-bold">استوديو CAD المتكامل</h1>
                        <p className="text-blue-100">رسم المخططات • دعم DWG كامل • مكتبة رموز • AutoCAD Interface</p>
                    </div>
                </div>
            </div>

            {/* Features Cards */}
            <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">دعم DWG/DXF</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">AutoCAD 2000-2024</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                        <div className="flex items-center gap-3">
                            <Ruler className="w-6 h-6 text-green-600 dark:text-green-400" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">أدوات الرسم</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Line, Circle, Rectangle +</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                        <div className="flex items-center gap-3">
                            <Layers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">الطبقات</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Layers Management</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                        <div className="flex items-center gap-3">
                            <Box className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">مكتبة الرموز</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">أبواب، شبابيك، أثاث</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features List */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">⚡ الميزات الرئيسية</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        <span>Zoom & Pan</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        <span>Smart Dimensions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        <span>Grid & Snap</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        <span>Ortho Mode</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        <span>AutoCAD Shortcuts</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        <span>Command Line</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        <span>Undo/Redo</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        <span>Export DWG/IFC</span>
                    </div>
                </div>
            </div>

            {/* Shortcuts Guide */}
            <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">⌨️ الاختصارات - مثل AutoCAD</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <span className="text-gray-700 dark:text-gray-300">خط</span>
                        <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">L</code>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <span className="text-gray-700 dark:text-gray-300">دائرة</span>
                        <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">C</code>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <span className="text-gray-700 dark:text-gray-300">مستطيل</span>
                        <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">REC</code>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <span className="text-gray-700 dark:text-gray-300">قياس</span>
                        <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">DIM</code>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <span className="text-gray-700 dark:text-gray-300">تراجع</span>
                        <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">Ctrl+Z</code>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <span className="text-gray-700 dark:text-gray-300">حفظ</span>
                        <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">Ctrl+S</code>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <span className="text-gray-700 dark:text-gray-300">تكبير</span>
                        <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">Z+E</code>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <span className="text-gray-700 dark:text-gray-300">إلغاء</span>
                        <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">ESC</code>
                    </div>
                </div>
            </div>

            {/* CAD Studio iframe */}
            <div className="flex-1 relative">
                <iframe
                    src="/cad-studio.html"
                    className="w-full h-full border-0"
                    title="استوديو CAD المتكامل"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
                />
            </div>
        </div>
    );
};

export default CADStudio;
