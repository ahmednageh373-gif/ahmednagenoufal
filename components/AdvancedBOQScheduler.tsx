/**
 * Advanced BOQ Scheduler - مولد جدول متقدم مع قراءة المواصفات
 * يقرأ المواصفات التفصيلية ويفكك كل بند إلى أنشطة متعددة
 */

import React, { useState } from 'react';
import { AdvancedScheduleActivity, WBSItem } from '../types';
import { ExcelParser, ParsedBOQItem } from '../services/ExcelParser';
import { SpecificationsAnalyzer, DetailedSpecification } from '../intelligence/SpecificationsAnalyzer';
import { CPMEngine } from '../intelligence/CPMEngine';
import { SBCCompliance } from '../intelligence/SBCCompliance';
import { Upload, FileSpreadsheet, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

interface AdvancedBOQSchedulerProps {
    onScheduleGenerated: (activities: AdvancedScheduleActivity[], wbs: WBSItem[], parsedItems: ParsedBOQItem[]) => void;
}

export const AdvancedBOQScheduler: React.FC<AdvancedBOQSchedulerProps> = ({
    onScheduleGenerated
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [projectStartDate, setProjectStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [progress, setProgress] = useState<{
        phase: string;
        current: number;
        total: number;
        details: string;
    } | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0] || null;
        if (selectedFile) {
            if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
                setFile(selectedFile);
                setError(null);
                setStatus('');
            } else {
                setFile(null);
                setError('يرجى اختيار ملف Excel (.xlsx أو .xls)');
            }
        }
    };

    const updateProgress = (phase: string, current: number, total: number, details: string) => {
        setProgress({ phase, current, total, details });
    };

    const handleGenerateSchedule = async () => {
        if (!file) {
            setError('يرجى اختيار ملف Excel أولاً');
            return;
        }

        setIsProcessing(true);
        setError(null);
        setStatus('');

        try {
            // المرحلة 1: قراءة ملف Excel
            updateProgress('قراءة', 1, 6, 'جاري قراءة ملف Excel...');
            const parsedItems = await ExcelParser.parseExcelWithSpecs(file);
            setStatus(`✅ تم قراءة ${parsedItems.length} بند من الملف`);
            
            await new Promise(resolve => setTimeout(resolve, 500));

            // المرحلة 2: تحليل المواصفات
            updateProgress('تحليل', 2, 6, `جاري تحليل مواصفات ${parsedItems.length} بند...`);
            const detailedSpecs: DetailedSpecification[] = [];
            let totalActivitiesExtracted = 0;

            for (let i = 0; i < parsedItems.length; i++) {
                const item = parsedItems[i];
                const spec = SpecificationsAnalyzer.analyzeSpecifications(
                    item.serialNumber,
                    item.category,
                    item.itemName,
                    item.description,
                    item.specifications,
                    item.unit,
                    item.quantity,
                    item.unitPrice
                );
                detailedSpecs.push(spec);
                totalActivitiesExtracted += spec.extractedActivities.length;

                // تحديث التقدم كل 50 بند
                if (i % 50 === 0) {
                    updateProgress('تحليل', 2, 6, 
                        `تحليل البند ${i + 1}/${parsedItems.length} - تم استخراج ${totalActivitiesExtracted} نشاط`
                    );
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
            }
            
            setStatus(`✅ تم استخراج ${totalActivitiesExtracted} نشاط من ${parsedItems.length} بند`);
            await new Promise(resolve => setTimeout(resolve, 500));

            // المرحلة 3: تحويل إلى أنشطة جدول زمني
            updateProgress('تحويل', 3, 6, 'جاري تحويل الأنشطة إلى جدول زمني...');
            let activities = SpecificationsAnalyzer.convertToScheduleActivities(
                detailedSpecs,
                new Date(projectStartDate)
            );
            setStatus(`✅ تم إنشاء ${activities.length} نشاط في الجدول الزمني`);
            await new Promise(resolve => setTimeout(resolve, 500));

            // المرحلة 4: فحص الامتثال SBC
            updateProgress('فحص', 4, 6, 'جاري فحص الامتثال للكود السعودي...');
            SBCCompliance.applyComplianceAdjustments(activities);
            const complianceReport = SBCCompliance.generateComplianceReport(activities);
            setStatus(`✅ فحص SBC: ${complianceReport.compliantActivities} ممتثل، ${complianceReport.nonCompliantActivities} يحتاج تعديل`);
            await new Promise(resolve => setTimeout(resolve, 500));

            // المرحلة 5: إنشاء العلاقات التلقائية
            updateProgress('علاقات', 5, 6, 'جاري إنشاء العلاقات بين الأنشطة...');
            CPMEngine.autoGenerateDependencies(activities);
            setStatus(`✅ تم إنشاء العلاقات التلقائية`);
            await new Promise(resolve => setTimeout(resolve, 500));

            // المرحلة 6: حساب CPM
            updateProgress('CPM', 6, 6, 'جاري حساب المسار الحرج...');
            const cpmResult = CPMEngine.performCPM(activities, new Date(projectStartDate));
            activities = activities.map(act => {
                const updated = cpmResult.criticalActivities.find(ca => ca.id === act.id);
                return updated || act;
            });
            setStatus(`✅ المسار الحرج: ${cpmResult.criticalPath.length} نشاط حرج | مدة المشروع: ${cpmResult.projectDuration} يوم`);
            await new Promise(resolve => setTimeout(resolve, 500));

            // بناء WBS
            const wbs = buildWBSFromSpecs(detailedSpecs, activities);
            
            // إرسال النتائج
            onScheduleGenerated(activities, wbs, parsedItems);
            
            setProgress(null);
            setStatus(`
                🎉 تم التوليد بنجاح!
                
                📊 ${parsedItems.length} بند في المقايسة
                ⚡ ${activities.length} نشاط تفصيلي
                🎯 ${cpmResult.criticalPath.length} نشاط حرج
                📅 ${cpmResult.projectDuration} يوم مدة المشروع
                ✅ ${complianceReport.compliancePercentage.toFixed(1)}% امتثال SBC
            `);

        } catch (err: any) {
            console.error('خطأ في التوليد:', err);
            setError(`خطأ: ${err.message}`);
            setProgress(null);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center mb-6">
                <Zap className="w-6 h-6 ml-2 text-yellow-500" />
                <h2 className="text-2xl font-bold">مولد الجدول الذكي - قراءة المواصفات التفصيلية</h2>
            </div>

            {/* معلومات توضيحية */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                    <FileSpreadsheet className="w-5 h-5 ml-2" />
                    ما الجديد في هذا النظام؟
                </h3>
                <ul className="text-sm space-y-1 mr-4 text-blue-700 dark:text-blue-300">
                    <li>✅ يقرأ رقم البند، اسم البند، والمواصفات التفصيلية الكاملة</li>
                    <li>✅ يحلل المواصفات ويستخرج الأنشطة المخفية (حفر، خرسانة، حديد، عزل، ردم...)</li>
                    <li>✅ كل بند يتحول إلى عدة أنشطة حسب المواصفات</li>
                    <li>✅ 470 بند → 1500+ نشاط تفصيلي</li>
                    <li>✅ يفهم تسلسل الأعمال من المواصفات</li>
                </ul>
            </div>

            {/* اختيار الملف */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">تاريخ بدء المشروع</label>
                    <input 
                        type="date"
                        value={projectStartDate}
                        onChange={(e) => setProjectStartDate(e.target.value)}
                        className="w-full p-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                        disabled={isProcessing}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">ملف المقايسة (Excel)</label>
                    <input 
                        type="file"
                        onChange={handleFileChange}
                        accept=".xlsx,.xls"
                        className="w-full p-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                        disabled={isProcessing}
                    />
                    {file && (
                        <p className="text-sm text-green-600 mt-2 flex items-center">
                            <CheckCircle2 className="w-4 h-4 ml-1" />
                            تم اختيار: {file.name}
                        </p>
                    )}
                </div>

                {/* شريط التقدم */}
                {progress && (
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                            <span className="font-semibold">{progress.phase}</span>
                            <span className="text-sm text-gray-600">{progress.current}/{progress.total}</span>
                        </div>
                        <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-3 mb-2">
                            <div 
                                className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${(progress.current / progress.total) * 100}%` }}
                            />
                        </div>
                        <p className="text-sm text-gray-600">{progress.details}</p>
                    </div>
                )}

                {/* حالة التنفيذ */}
                {status && !error && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg whitespace-pre-line">
                        {status}
                    </div>
                )}

                {/* الأخطاء */}
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg flex items-start">
                        <AlertCircle className="w-5 h-5 ml-2 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* زر التوليد */}
                <button
                    onClick={handleGenerateSchedule}
                    disabled={!file || isProcessing}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 font-bold text-lg flex items-center justify-center shadow-lg"
                >
                    {isProcessing ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-3"></div>
                            جاري التوليد...
                        </>
                    ) : (
                        <>
                            <Zap className="w-6 h-6 ml-2" />
                            توليد الجدول الزمني من المواصفات
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

/**
 * بناء WBS من المواصفات
 */
function buildWBSFromSpecs(
    specs: DetailedSpecification[],
    activities: AdvancedScheduleActivity[]
): WBSItem[] {
    const wbsMap = new Map<string, WBSItem>();

    for (const spec of specs) {
        const categoryCode = spec.category || '99';
        
        if (!wbsMap.has(categoryCode)) {
            wbsMap.set(categoryCode, {
                code: categoryCode,
                level: 1,
                name: `فئة ${categoryCode}`,
                activities: [],
                totalDuration: 0,
                totalCost: 0
            });
        }

        const wbsItem = wbsMap.get(categoryCode)!;
        const itemActivities = activities.filter(a => a.wbsCode.startsWith(categoryCode));
        wbsItem.activities.push(...itemActivities);
        wbsItem.totalDuration = Math.max(wbsItem.totalDuration, ...itemActivities.map(a => a.duration));
        wbsItem.totalCost += spec.originalItem.total;
    }

    return Array.from(wbsMap.values());
}

export default AdvancedBOQScheduler;
