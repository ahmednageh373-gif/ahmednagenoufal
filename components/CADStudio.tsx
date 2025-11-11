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
                        <h1 className="text-2xl font-bold">استوديو CAD v2.0 - محرك الرسم الهندسي المتكامل</h1>
                        <p className="text-blue-100">رسم 2D/3D • نظام طبقات متقدم • Object Snap • أدوات تعديل • مكتبة رموز شاملة</p>
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
                                <h3 className="font-semibold text-gray-900 dark:text-white">نظام طبقات متقدم</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Show/Hide, Freeze, Lock</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                        <div className="flex items-center gap-3">
                            <Ruler className="w-6 h-6 text-green-600 dark:text-green-400" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">أدوات رسم وتعديل</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Move, Copy, Rotate, Trim +</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                        <div className="flex items-center gap-3">
                            <Layers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">مكتبة رموز شاملة</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">17+ Blocks with Drag & Drop</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                        <div className="flex items-center gap-3">
                            <Box className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">تحويل 2D إلى 3D</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Extrude + 3D Viewer</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features List */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">⚡ الميزات الرئيسية - v2.0</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        <span>Enhanced Layer System</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        <span>Object Snap (6 Types)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        <span>Ortho Mode (F8)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        <span>Modify Tools</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        <span>Block Library (17+ Blocks)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        <span>Drag & Drop Insertion</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        <span>2D to 3D Extrusion</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        <span>3D Viewer (Three.js)</span>
                    </div>
                </div>
            </div>

            {/* Shortcuts Guide */}
            <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">⌨️ الاختصارات - v2.0</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <span className="text-gray-700 dark:text-gray-300">نقل</span>
                        <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">M</code>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <span className="text-gray-700 dark:text-gray-300">نسخ</span>
                        <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">CO</code>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <span className="text-gray-700 dark:text-gray-300">دوران</span>
                        <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">RO</code>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <span className="text-gray-700 dark:text-gray-300">قص</span>
                        <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">TR</code>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <span className="text-gray-700 dark:text-gray-300">تمديد</span>
                        <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">EX</code>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <span className="text-gray-700 dark:text-gray-300">إزاحة</span>
                        <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">O</code>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <span className="text-gray-700 dark:text-gray-300">بثق 3D</span>
                        <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">EXT</code>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <span className="text-gray-700 dark:text-gray-300">Ortho</span>
                        <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">F8</code>
                    </div>
                </div>
            </div>

            {/* CAD Studio v2.0 iframe */}
            <div className="flex-1 relative">
                <iframe
                    src="/cad-studio-v2.html"
                    className="w-full h-full border-0"
                    title="استوديو CAD v2.0 - محرك الرسم الهندسي المتكامل"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
                />
            </div>
        </div>
    );
};

export default CADStudio;
