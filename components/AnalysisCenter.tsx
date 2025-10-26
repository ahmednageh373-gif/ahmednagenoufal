import React, { useState } from 'react';
import type { Project, BOQMatch, FinancialItem } from '../types';

import { BOQReconciliationTab } from './BOQReconciliationTab';
import { ComparativeAnalysisTab } from './ComparativeAnalysisTab';
import { DrawingAnalysisTab } from './DrawingAnalysisTab';
import { ValueEngineeringTab } from './ValueEngineeringTab';
import { SaudiCodeConsultantTab } from './SaudiCodeConsultantTab';
import { ImageAnalysisTab } from './ImageAnalysisTab';
import { ScribdAnalyzerTab } from './ScribdAnalyzerTab';
import { ComplexQueryTab } from './ComplexQueryTab';
import { ImageGenerationTab } from './ImageGenerationTab';
import { VideoGenerationTab } from './VideoGenerationTab';
import { LocationIntelligenceTab } from './LocationIntelligenceTab';
import { EngineeringCalcsTab } from './EngineeringCalcsTab';
import { ConceptualEstimatorTab } from './ConceptualEstimatorTab';
import { SentimentAnalysisTab } from './SentimentAnalysisTab';
import { DynamicPricingTab } from './DynamicPricingTab';
import { CuringAnalysisTab } from './CuringAnalysisTab';
import { QualityPlanGeneratorTab } from './QualityPlanGeneratorTab';


interface AnalysisCenterProps {
    project: Project;
    onUpdateBoqReconciliation: (projectId: string, newMatches: BOQMatch[]) => void;
    onUpdateComparativeAnalysis: (projectId: string, newReport: string) => void;
    onUpdateFinancials: (projectId: string, newFinancials: FinancialItem[]) => void;
}

const tabs = [
    { id: 'reconciliation', label: 'مطابقة المقايسات' },
    { id: 'valueEngineering', label: 'هندسة القيمة' },
    { id: 'drawingAnalysis', label: 'تحليل المخططات' },
    { id: 'saudiCode', label: 'استشارات الكود السعودي' },
    { id: 'comparative', label: 'تحليل مقارن' },
    { id: 'qualityPlan', label: 'خطة الجودة (AI)' },
    { id: 'image', label: 'تحليل الصور' },
    { id: 'scribd', label: 'محلل Scribd' },
    { id: 'complexQuery', label: 'استعلام معقد' },
    { id: 'imageGen', label: 'إنشاء الصور' },
    { id: 'videoGen', label: 'إنشاء الفيديو' },
    { id: 'location', label: 'استعلام جغرافي' },
    { id: 'engCalcs', label: 'حسابات هندسية' },
    { id: 'curingAnalysis', label: 'تحليل المعالجة' },
    { id: 'conceptualEst', label: 'تقدير مبدئي' },
    { id: 'sentiment', label: 'تحليل المشاعر' },
    { id: 'dynamicPricing', label: 'التسعير الديناميكي' },
];

export const AnalysisCenter: React.FC<AnalysisCenterProps> = ({ project, onUpdateBoqReconciliation, onUpdateComparativeAnalysis, onUpdateFinancials }) => {
    const [activeTab, setActiveTab] = useState('reconciliation');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'reconciliation':
                return <BOQReconciliationTab project={project} onUpdateBoqReconciliation={onUpdateBoqReconciliation} />;
            case 'valueEngineering':
                return <ValueEngineeringTab project={project} />;
            case 'drawingAnalysis':
                return <DrawingAnalysisTab project={project} onUpdateFinancials={onUpdateFinancials} />;
            case 'saudiCode':
                return <SaudiCodeConsultantTab project={project} />;
            case 'comparative':
                return <ComparativeAnalysisTab project={project} onUpdateComparativeAnalysis={onUpdateComparativeAnalysis} />;
            case 'image':
                 return <ImageAnalysisTab />;
            case 'scribd':
                return <ScribdAnalyzerTab />;
            case 'complexQuery':
                return <ComplexQueryTab />;
            case 'imageGen':
                return <ImageGenerationTab />;
            case 'videoGen':
                return <VideoGenerationTab />;
            case 'location':
                return <LocationIntelligenceTab />;
            case 'engCalcs':
                return <EngineeringCalcsTab />;
            case 'curingAnalysis':
                return <CuringAnalysisTab />;
            case 'conceptualEst':
                return <ConceptualEstimatorTab project={project} />;
            case 'sentiment':
                return <SentimentAnalysisTab />;
            case 'dynamicPricing':
                return <DynamicPricingTab project={project} />;
            case 'qualityPlan':
                return <QualityPlanGeneratorTab project={project} />;
            default:
                return null;
        }
    };
    
    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold">مركز التحليل بالذكاء الاصطناعي</h1>
                <p className="text-gray-500 mt-1">أدوات متقدمة لتحليل بيانات المشروع واتخاذ قرارات ذكية.</p>
            </header>
            
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-4 rtl:space-x-reverse overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                                activeTab === tab.id
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div>
                {renderTabContent()}
            </div>
        </div>
    );
};