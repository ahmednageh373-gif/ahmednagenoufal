import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Palette, Type, Layout, Sparkles, RotateCcw, Save, Moon, Sun, Monitor, Circle, Square, Hexagon, Maximize, Minimize, Zap, Eye, Download, Upload } from 'lucide-react';
import type { ThemeConfig, ThemeMode, ColorScheme, FontSize } from '@/types';

export const ThemeCustomizer: React.FC = () => {
    const { theme, updateTheme, resetTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'layout' | 'presets'>('colors');
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [presetName, setPresetName] = useState('');

    const colorSchemes: { value: ColorScheme; label: string; labelAr: string; colors: string[] }[] = [
        { value: 'default', label: 'Indigo', labelAr: 'نيلي', colors: ['#6366f1', '#4f46e5', '#a5b4fc'] },
        { value: 'blue', label: 'Blue', labelAr: 'أزرق', colors: ['#3b82f6', '#2563eb', '#93c5fd'] },
        { value: 'green', label: 'Green', labelAr: 'أخضر', colors: ['#22c55e', '#16a34a', '#86efac'] },
        { value: 'purple', label: 'Purple', labelAr: 'بنفسجي', colors: ['#a855f7', '#9333ea', '#d8b4fe'] },
        { value: 'orange', label: 'Orange', labelAr: 'برتقالي', colors: ['#f97316', '#ea580c', '#fdba74'] },
        { value: 'red', label: 'Red', labelAr: 'أحمر', colors: ['#ef4444', '#dc2626', '#fca5a5'] },
        { value: 'teal', label: 'Teal', labelAr: 'أزرق مخضر', colors: ['#14b8a6', '#0d9488', '#5eead4'] },
        { value: 'pink', label: 'Pink', labelAr: 'وردي', colors: ['#ec4899', '#db2777', '#f9a8d4'] },
    ];

    const fontSizes: { value: FontSize; label: string; labelAr: string; size: string }[] = [
        { value: 'small', label: 'Small', labelAr: 'صغير', size: '14px' },
        { value: 'medium', label: 'Medium', labelAr: 'متوسط', size: '16px' },
        { value: 'large', label: 'Large', labelAr: 'كبير', size: '18px' },
        { value: 'extra-large', label: 'Extra Large', labelAr: 'كبير جداً', size: '20px' },
    ];

    const themeModes: { value: ThemeMode; label: string; labelAr: string; icon: React.ElementType }[] = [
        { value: 'light', label: 'Light', labelAr: 'فاتح', icon: Sun },
        { value: 'dark', label: 'Dark', labelAr: 'داكن', icon: Moon },
        { value: 'auto', label: 'Auto', labelAr: 'تلقائي', icon: Monitor },
    ];

    const handleExportTheme = () => {
        const themeJson = JSON.stringify(theme, null, 2);
        const blob = new Blob([themeJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `theme-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedTheme = JSON.parse(e.target?.result as string) as ThemeConfig;
                    updateTheme(importedTheme);
                } catch (error) {
                    alert('خطأ في استيراد السمة. تأكد من صحة ملف JSON');
                }
            };
            reader.readAsText(file);
        }
    };

    const presetThemes: { name: string; nameAr: string; config: Partial<ThemeConfig>; description: string }[] = [
        {
            name: 'Professional',
            nameAr: 'احترافي',
            description: 'Clean and professional look',
            config: {
                colorScheme: 'default',
                fontSize: 'medium',
                borderRadius: 'small',
                spacing: 'normal',
                animations: true,
                highContrast: false,
            },
        },
        {
            name: 'Modern',
            nameAr: 'عصري',
            description: 'Bold colors with smooth animations',
            config: {
                colorScheme: 'purple',
                fontSize: 'medium',
                borderRadius: 'large',
                spacing: 'comfortable',
                animations: true,
                highContrast: false,
            },
        },
        {
            name: 'Minimalist',
            nameAr: 'بسيط',
            description: 'Simple and clean interface',
            config: {
                colorScheme: 'blue',
                fontSize: 'medium',
                borderRadius: 'none',
                spacing: 'compact',
                animations: false,
                highContrast: false,
            },
        },
        {
            name: 'High Contrast',
            nameAr: 'تباين عالي',
            description: 'Enhanced visibility and accessibility',
            config: {
                colorScheme: 'default',
                fontSize: 'large',
                borderRadius: 'small',
                spacing: 'comfortable',
                animations: false,
                highContrast: true,
            },
        },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                            <Palette className="text-indigo-600 dark:text-indigo-400" size={32} />
                            تخصيص المظهر
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            قم بتخصيص ألوان التطبيق وخطوطه والمظهر العام ليناسب تفضيلاتك
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleExportTheme}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Download size={18} />
                            تصدير
                        </button>
                        <label className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
                            <Upload size={18} />
                            استيراد
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImportTheme}
                                className="hidden"
                            />
                        </label>
                        <button
                            onClick={resetTheme}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <RotateCcw size={18} />
                            إعادة تعيين
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="flex gap-1 p-2">
                        {[
                            { id: 'colors' as const, label: 'الألوان', icon: Palette },
                            { id: 'typography' as const, label: 'الخطوط', icon: Type },
                            { id: 'layout' as const, label: 'التخطيط', icon: Layout },
                            { id: 'presets' as const, label: 'السمات الجاهزة', icon: Sparkles },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                <tab.icon size={20} />
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {/* Colors Tab */}
                    {activeTab === 'colors' && (
                        <div className="space-y-6">
                            {/* Theme Mode */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                                    وضع المظهر
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {themeModes.map(mode => {
                                        const Icon = mode.icon;
                                        return (
                                            <button
                                                key={mode.value}
                                                onClick={() => updateTheme({ mode: mode.value })}
                                                className={`p-6 rounded-lg border-2 transition-all ${
                                                    theme.mode === mode.value
                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                                                }`}
                                            >
                                                <Icon size={32} className="mx-auto mb-3 text-indigo-600 dark:text-indigo-400" />
                                                <div className="text-center">
                                                    <p className="font-semibold text-gray-800 dark:text-gray-100">{mode.labelAr}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{mode.label}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Color Schemes */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                                    نظام الألوان
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {colorSchemes.map(scheme => (
                                        <button
                                            key={scheme.value}
                                            onClick={() => updateTheme({ colorScheme: scheme.value })}
                                            className={`p-4 rounded-lg border-2 transition-all ${
                                                theme.colorScheme === scheme.value
                                                    ? 'border-indigo-500 shadow-lg'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                                            }`}
                                        >
                                            <div className="flex gap-2 mb-3">
                                                {scheme.colors.map((color, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-full h-8 rounded"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-100">{scheme.labelAr}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{scheme.label}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* High Contrast Toggle */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Eye size={24} className="text-indigo-600 dark:text-indigo-400" />
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-100">تباين عالي</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            تحسين الوضوح وإمكانية الوصول
                                        </p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={theme.highContrast}
                                        onChange={(e) => updateTheme({ highContrast: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Typography Tab */}
                    {activeTab === 'typography' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                                    حجم الخط
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {fontSizes.map(size => (
                                        <button
                                            key={size.value}
                                            onClick={() => updateTheme({ fontSize: size.value })}
                                            className={`p-6 rounded-lg border-2 transition-all ${
                                                theme.fontSize === size.value
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                                            }`}
                                        >
                                            <Type size={32} className="mx-auto mb-3 text-indigo-600 dark:text-indigo-400" />
                                            <p className="font-semibold text-gray-800 dark:text-gray-100">{size.labelAr}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{size.size}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Preview Text */}
                            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                                    معاينة حجم الخط
                                </h4>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    هذا نص تجريبي لمعاينة حجم الخط المختار. يمكنك رؤية كيف سيظهر النص في التطبيق.
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                    This is sample text to preview the selected font size. You can see how the text will appear in the application.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Layout Tab */}
                    {activeTab === 'layout' && (
                        <div className="space-y-6">
                            {/* Border Radius */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                                    استدارة الحواف
                                </h3>
                                <div className="grid grid-cols-4 gap-4">
                                    {[
                                        { value: 'none' as const, label: 'بدون', icon: Square },
                                        { value: 'small' as const, label: 'صغير', icon: Square },
                                        { value: 'medium' as const, label: 'متوسط', icon: Circle },
                                        { value: 'large' as const, label: 'كبير', icon: Hexagon },
                                    ].map(radius => {
                                        const Icon = radius.icon;
                                        return (
                                            <button
                                                key={radius.value}
                                                onClick={() => updateTheme({ borderRadius: radius.value })}
                                                className={`p-6 rounded-lg border-2 transition-all ${
                                                    theme.borderRadius === radius.value
                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                                                }`}
                                            >
                                                <Icon size={32} className="mx-auto mb-3 text-indigo-600 dark:text-indigo-400" />
                                                <p className="font-semibold text-gray-800 dark:text-gray-100">{radius.label}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Spacing */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                                    التباعد
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { value: 'compact' as const, label: 'مضغوط', icon: Minimize },
                                        { value: 'normal' as const, label: 'عادي', icon: Square },
                                        { value: 'comfortable' as const, label: 'مريح', icon: Maximize },
                                    ].map(spacing => {
                                        const Icon = spacing.icon;
                                        return (
                                            <button
                                                key={spacing.value}
                                                onClick={() => updateTheme({ spacing: spacing.value })}
                                                className={`p-6 rounded-lg border-2 transition-all ${
                                                    theme.spacing === spacing.value
                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                                                }`}
                                            >
                                                <Icon size={32} className="mx-auto mb-3 text-indigo-600 dark:text-indigo-400" />
                                                <p className="font-semibold text-gray-800 dark:text-gray-100">{spacing.label}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Animations Toggle */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Zap size={24} className="text-indigo-600 dark:text-indigo-400" />
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-100">الرسوم المتحركة</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            تفعيل التأثيرات الحركية الانتقالية
                                        </p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={theme.animations}
                                        onChange={(e) => updateTheme({ animations: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Presets Tab */}
                    {activeTab === 'presets' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                                    السمات الجاهزة
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {presetThemes.map(preset => (
                                        <div
                                            key={preset.name}
                                            className="p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300 transition-all"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h4 className="font-bold text-gray-800 dark:text-gray-100">{preset.nameAr}</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{preset.name}</p>
                                                </div>
                                                <Sparkles size={24} className="text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                {preset.description}
                                            </p>
                                            <button
                                                onClick={() => updateTheme(preset.config)}
                                                className="w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                                            >
                                                تطبيق السمة
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                    معاينة التصميم
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
                        <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">عنصر أساسي</h4>
                        <p className="text-sm text-indigo-700 dark:text-indigo-300">هذا مثال على عنصر بالألوان الأساسية</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">عنصر ثانوي</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">هذا مثال على عنصر بالألوان الثانوية</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">عنصر نجاح</h4>
                        <p className="text-sm text-green-700 dark:text-green-300">هذا مثال على عنصر بألوان النجاح</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeCustomizer;
