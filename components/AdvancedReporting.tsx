import React, { useState, useEffect } from 'react';
import { CostPredictionEngine, DurationPredictionEngine, ScheduleOptimizationEngine } from '../services/AIOptimizationEngine';
import type { Project, ScheduleTask } from '../types';
import { Bot, LineChart, Clock, ListTree, Loader2 } from '../lucide-icons';
import { mockProjects } from '../data/mockData'; // Using mock projects as historical data

// Placeholder interfaces matching the engine's requirements
interface EngineProject {
  id: string; name: string; type: 'Residential' | 'Commercial' | 'Industrial' | 'Infrastructure';
  location: { city: string; region: string; latitude: number; longitude: number; };
  totalArea: number; budget: number; duration: number; complexity: number; // 1-10
}
interface EngineHistoricalProject extends EngineProject {
  actualCost: number; actualDuration: number; delayReasons: string[]; costOverrunReasons: string[];
  weatherImpact: number; qualityScore: number; safetyScore: number;
}
interface EngineActivity { id: string; name: string; duration: number; predecessors?: string[]; resources?: string[]; }


const AdvancedReporting: React.FC<{ project: Project }> = ({ project }) => {
    const [activeTab, setActiveTab] = useState('cost');
    const [isLoading, setIsLoading] = useState(false);
    const [report, setReport] = useState<any>(null);

    // This is a simplified mapping and data generation for demonstration
    const historicalData: EngineHistoricalProject[] = mockProjects.map((p, i) => ({
        id: p.id, name: p.name, type: 'Residential', 
        location: { city: 'الرياض', region: 'Central', latitude: 24.7, longitude: 46.6 },
        totalArea: 400 + i * 100, budget: 1500000 + i*100000, duration: 365, complexity: 6,
        actualCost: 1650000 + i*120000, actualDuration: 400 + i*10, delayReasons: [], costOverrunReasons: [],
        weatherImpact: 0.8, qualityScore: 4, safetyScore: 4
    }));

    const handleRunAnalysis = async () => {
        setIsLoading(true);
        setReport(null);
        
        try {
            if (activeTab === 'cost') {
                const costEngine = new CostPredictionEngine();
                await costEngine.trainModel(historicalData);
                const newProject: EngineProject = {
                    id: 'new-proj', name: 'مشروع جديد مقترح', type: 'Residential', 
                    location: { city: 'الرياض', region: 'Central', latitude: 24.7, longitude: 46.6 },
                    totalArea: 500, budget: 2000000, duration: 365, complexity: 7
                };
                const prediction = await costEngine.predict(newProject);
                setReport({ type: 'cost', ...prediction });
            } else if (activeTab === 'duration') {
                const durationEngine = new DurationPredictionEngine();
                 const newProject: EngineProject = {
                    id: 'new-proj', name: 'مشروع جديد مقترح', type: 'Residential', 
                    location: { city: 'الرياض', region: 'Central', latitude: 24.7, longitude: 46.6 },
                    totalArea: 500, budget: 2000000, duration: 365, complexity: 7
                };
                const prediction = await durationEngine.predictDuration(newProject, historicalData);
                setReport({ type: 'duration', ...prediction });

            } else if (activeTab === 'schedule') {
                const scheduleEngine = new ScheduleOptimizationEngine();
                const activities: EngineActivity[] = project.data.schedule.map(t => ({
                    id: String(t.id),
                    name: t.name,
                    duration: Math.ceil((new Date(t.end).getTime() - new Date(t.start).getTime()) / (1000 * 60 * 60 * 24)) + 1,
                    predecessors: t.dependencies.map(String),
                }));
                const optimization = scheduleEngine.optimizeSchedule(activities, []);
                setReport({ type: 'schedule', ...optimization });
            }
        } catch (e) {
            console.error("Analysis failed:", e);
            setReport({ error: (e as Error).message });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">التقارير المتقدمة والتحسين</h1>
             <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <button onClick={() => setActiveTab('cost')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'cost' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>التنبؤ بالتكاليف</button>
                    <button onClick={() => setActiveTab('duration')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'duration' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>التنبؤ بالمدة</button>
                    <button onClick={() => setActiveTab('schedule')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'schedule' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>تحسين الجدول الزمني</button>
                </nav>
            </div>
            
            <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl shadow-sm text-center">
                 <button onClick={handleRunAnalysis} disabled={isLoading} className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 mx-auto">
                    {isLoading ? <Loader2 className="animate-spin" /> : <Bot />}
                    <span>{isLoading ? 'جاري التحليل العميق...' : 'تشغيل التحليل'}</span>
                </button>
                 <p className="text-xs text-slate-500 mt-2">ملاحظة: هذا التحليل يستخدم بيانات المشروع الحالية والمشاريع الأخرى كبيانات تاريخية لتدريب النماذج.</p>
            </div>
            
            {report && (
                <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl shadow-sm">
                    {report.error && <p className="text-red-500">{report.error}</p>}
                    {report.type === 'cost' && (
                        <>
                            <h3 className="text-xl font-bold mb-4">نتائج التنبؤ بالتكاليف</h3>
                            <p>التكلفة المتوقعة: <span className="font-bold text-lg text-indigo-500">{report.predictedCost.toLocaleString('ar-SA')} SAR</span></p>
                            <p>نطاق الثقة (90%): {report.lowerBound.toLocaleString('ar-SA')} - {report.upperBound.toLocaleString('ar-SA')} SAR</p>
                        </>
                    )}
                     {report.type === 'duration' && (
                        <>
                            <h3 className="text-xl font-bold mb-4">نتائج التنبؤ بالمدة</h3>
                            <p>المدة المتوقعة (PERT): <span className="font-bold text-lg text-indigo-500">{report.estimatedDuration} يوم</span></p>
                            <p>متفائل: {report.optimistic} يوم, الأكثر احتمالاً: {report.mostLikely} يوم, متشائم: {report.pessimistic} يوم</p>
                        </>
                    )}
                     {report.type === 'schedule' && (
                        <>
                            <h3 className="text-xl font-bold mb-4">نتائج تحسين الجدول الزمني</h3>
                            <p>التحسين المحقق: <span className="font-bold text-lg text-green-500">{report.improvement.toFixed(1)}%</span></p>
                            <p>المدة الجديدة: {report.totalDuration} يوم</p>
                            <p>المسار الحرج: {report.criticalPath.join(' -> ')}</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdvancedReporting;