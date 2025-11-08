import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { Sidebar } from './components/Sidebar';
import { Menu } from 'lucide-react';
import { ProjectModal } from './components/ProjectModal';
import { mockProjects } from './data/mockData';
// Fix: Correct import path for types.
import type { Project, ProjectItem, PurchaseOrder, Objective, KeyResult, ProjectWorkflow, FinancialItem, ScheduleTask, Risk, SiteLogEntry, Drawing, DrawingFolder, DocumentCategory, BOQMatch, AssistantSettings, Subcontractor, SubcontractorInvoice, StructuralAssessment, WorkLogEntry, ChecklistItem, ProjectMember } from './types';

// Lazy load all the main view components
const Dashboard = React.lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const ScheduleManager = React.lazy(() => import('./components/ScheduleManager').then(module => ({ default: module.ScheduleManager })));
const FinancialManager = React.lazy(() => import('./components/FinancialManager').then(module => ({ default: module.FinancialManager })));
const RiskManager = React.lazy(() => import('./components/RiskManager').then(module => ({ default: module.RiskManager })));
const SiteTracker = React.lazy(() => import('./components/SiteTracker').then(module => ({ default: module.SiteTracker })));
const DrawingManager = React.lazy(() => import('./components/DrawingManager').then(module => ({ default: module.DrawingManager })));
const EngineeringDocsManager = React.lazy(() => import('./components/EngineeringDocsManager').then(module => ({ default: module.EngineeringDocsManager })));
const ProcurementManager = React.lazy(() => import('./components/ProcurementManager').then(module => ({ default: module.ProcurementManager })));
const SubcontractorManager = React.lazy(() => import('./components/SubcontractorManager').then(module => ({ default: module.SubcontractorManager })));
const ProjectHub = React.lazy(() => import('./components/ProjectHub').then(module => ({ default: module.ProjectHub })));
const OKRManager = React.lazy(() => import('./components/OKRManager').then(module => ({ default: module.OKRManager })));
const WorkflowArchitect = React.lazy(() => import('./components/WorkflowArchitect').then(module => ({ default: module.WorkflowArchitect })));
const AutomationCenter = React.lazy(() => import('./components/AutomationCenter').then(module => ({ default: module.AutomationCenter })));
const AnalysisCenter = React.lazy(() => import('./components/AnalysisCenter').then(module => ({ default: module.AnalysisCenter })));
const LiveAssistant = React.lazy(() => import('./components/LiveAssistant').then(module => ({ default: module.LiveAssistant })));
const DocumentationViewer = React.lazy(() => import('./components/DocumentationViewer').then(module => ({ default: module.DocumentationViewer })));
const RecoveryPlanner = React.lazy(() => import('./components/RecoveryPlanner').then(module => ({ default: module.RecoveryPlanner })));
const AssessmentManager = React.lazy(() => import('./components/AssessmentManager').then(module => ({ default: module.AssessmentManager })));
const AuditLogViewer = React.lazy(() => import('./components/AuditLogViewer').then(module => ({ default: module.AuditLogViewer })));
const AdvancedReporting = React.lazy(() => import('./components/AdvancedReporting'));
const ProjectMembers = React.lazy(() => import('./components/ProjectMembers').then(module => ({ default: module.ProjectMembers })));
const BOQManualManager = React.lazy(() => import('./BOQManualManager').then(module => ({ default: module.BOQManualManager })));
const EngineeringKnowledge = React.lazy(() => import('./EngineeringKnowledge').then(module => ({ default: module.EngineeringKnowledge })));
const KnowledgeDatabase = React.lazy(() => import('./KnowledgeDatabase'));
const NOUFALBackendHub = React.lazy(() => import('./components/NOUFALBackendHub').then(module => ({ default: module.NOUFALBackendHub })));
const BlockLibrary = React.lazy(() => import('./components/BlockLibrary').then(module => ({ default: module.BlockLibrary })));
const BOQUploadHub = React.lazy(() => import('./components/BOQUploadHub').then(module => ({ default: module.default })));
const SBCComplianceChecker = React.lazy(() => import('./components/SBCComplianceChecker').then(module => ({ default: module.SBCComplianceChecker })));
const ScheduleAnalysis = React.lazy(() => import('./components/schedule/ScheduleAnalysis').then(module => ({ default: module.ScheduleAnalysis })));
const NOUFALCommandCenter = React.lazy(() => import('./components/NOUFALCommandCenter').then(module => ({ default: module.default })));
const LibraryShowcase = React.lazy(() => import('./components/LibraryShowcase').then(module => ({ default: module.default })));
const ManualAnalysisMode = React.lazy(() => import('./components/ManualAnalysisMode').then(module => ({ default: module.default })));
const QuantitiesExtractionPage = React.lazy(() => import('./components/QuantitiesExtractionPage').then(module => ({ default: module.default })));
const NOUFALEnhanced = React.lazy(() => import('./components/NOUFALEnhanced').then(module => ({ default: module.default })));
const SmartReportsSystem = React.lazy(() => import('./components/SmartReportsSystem').then(module => ({ default: module.default })));
const AdvancedAIFeatures = React.lazy(() => import('./components/AdvancedAIFeatures').then(module => ({ default: module.default })));
const ProEngineeringHub = React.lazy(() => import('./components/ProEngineeringHub').then(module => ({ default: module.default })));
const RealAIProcessor = React.lazy(() => import('./components/RealAIProcessor').then(module => ({ default: module.default })));
const NOUFALIntegratedSystem = React.lazy(() => import('./components/NOUFALIntegratedSystem').then(module => ({ default: module.default })));
// Primavera Magic Tools - أدوات Primavera السحرية
const PrimaveraMagicRouter = React.lazy(() => import('./components/primavera/PrimaveraMagicRouter').then(module => ({ default: module.default })));
// New Integrated ERP Systems - نظام التكامل الشامل
const ExecutiveDashboard = React.lazy(() => import('./components/ExecutiveDashboard').then(module => ({ default: module.ExecutiveDashboard })));
const ResourceManagement = React.lazy(() => import('./components/ResourceManagement').then(module => ({ default: module.ResourceManagement })));
const CostControlSystem = React.lazy(() => import('./components/CostControlSystem').then(module => ({ default: module.CostControlSystem })));
const ResourcesManager = React.lazy(() => import('./components/ResourcesManager').then(module => ({ default: module.ResourcesManager })));
const IntegratedAnalytics = React.lazy(() => import('./components/IntegratedAnalytics').then(module => ({ default: module.IntegratedAnalytics })));

// Advanced Construction Systems - الأنظمة المتقدمة للبناء
const AdvancedDashboard = React.lazy(() => import('./components/AdvancedDashboard').then(module => ({ default: module.default })));
const AdvancedAnalytics = React.lazy(() => import('./components/AdvancedAnalytics').then(module => ({ default: module.default })));
const InteractiveReports = React.lazy(() => import('./components/InteractiveReports').then(module => ({ default: module.default })));
const MobileFieldHub = React.lazy(() => import('./components/MobileFieldHub').then(module => ({ default: module.default })));
const RFIManager = React.lazy(() => import('./components/RFIManager').then(module => ({ default: module.default })));
const DesignExecutionManager = React.lazy(() => import('./components/DesignExecutionManager').then(module => ({ default: module.default })));
const IntegrationMonitor = React.lazy(() => import('./components/IntegrationMonitor').then(module => ({ default: module.default })));
const PDFManager = React.lazy(() => import('./components/PDFManager').then(module => ({ default: module.default })));
const ThemeCustomizer = React.lazy(() => import('./components/ThemeCustomizer').then(module => ({ default: module.default })));
const CADUnifiedPlatform = React.lazy(() => import('./components/CADUnifiedPlatform').then(module => ({ default: module.default })));


const LoadingSpinner = () => (
    <div className="flex flex-col justify-center items-center h-full min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
        <div className="text-center">
            <div className="relative mb-8">
                <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
                <div className="absolute inset-0 rounded-full h-20 w-20 border-t-4 border-b-4 border-purple-400 animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">جاري التحميل...</h2>
            <p className="text-gray-600 dark:text-gray-400 animate-pulse">يرجى الانتظار بينما نقوم بتحميل التطبيق</p>
        </div>
    </div>
);


const App: React.FC = () => {
    // Error state management
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    // Lazy initialize state from localStorage
    const [projects, setProjects] = useState<Project[]>(() => {
        try {
            const savedProjects = localStorage.getItem('AN_AI_PROJECTS');
            if (savedProjects) {
                return JSON.parse(savedProjects);
            }
        } catch (error) {
            console.error("Could not load projects from local storage", error);
            setHasError(true);
            setErrorMessage('فشل تحميل المشاريع من التخزين المحلي');
        }
        return mockProjects; // Fallback to mock data on first load or error
    });

    const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
        try {
            const savedId = localStorage.getItem('AN_AI_ACTIVE_PROJECT_ID');
            // Re-read projects here to ensure consistency, as state might not be set yet.
            const currentProjects = JSON.parse(localStorage.getItem('AN_AI_PROJECTS') || 'null') || mockProjects;
            
            // Check if the saved ID is valid for the loaded projects
            if (savedId && currentProjects.some((p: Project) => p.id === savedId)) {
                return savedId;
            }
             // Fallback to the first project if the saved ID is invalid or doesn't exist
            if (currentProjects.length > 0) {
                return currentProjects[0].id;
            }
        } catch (error) {
             console.error("Could not load active project ID from local storage", error);
        }
        return null; // No projects available
    });

    const [activeView, setActiveView] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
    
    // Loading timeout effect - if loading takes too long, show error
    useEffect(() => {
        const loadingTimeout = setTimeout(() => {
            if (isLoading) {
                console.warn('⚠️ Loading timeout reached - switching to fallback mode');
                setIsLoading(false);
                setHasError(true);
                setErrorMessage('انتهى وقت التحميل - يتم الآن تحميل الواجهة البديلة');
            }
        }, 15000); // 15 seconds timeout
        
        // Clear loading state after components mount
        const mountTimeout = setTimeout(() => {
            setIsLoading(false);
        }, 2000);
        
        return () => {
            clearTimeout(loadingTimeout);
            clearTimeout(mountTimeout);
        };
    }, [isLoading]);
    
    // Error boundary effect
    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            console.error('❌ Runtime Error:', event.error);
            setHasError(true);
            setErrorMessage(`خطأ في التشغيل: ${event.message}`);
        };
        
        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);
    
    // Effect to save state changes back to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('AN_AI_PROJECTS', JSON.stringify(projects));
            if (activeProjectId) {
                localStorage.setItem('AN_AI_ACTIVE_PROJECT_ID', activeProjectId);
            } else {
                 localStorage.removeItem('AN_AI_ACTIVE_PROJECT_ID');
            }
        } catch (error) {
            console.error("Could not save state to local storage", error);
        }
    }, [projects, activeProjectId]);


    const activeProject = projects.find(p => p.id === activeProjectId);

    const updateProjectData = useCallback((projectId: string, dataUpdater: (projectData: Project['data']) => Partial<Project['data']>) => {
        setProjects(prevProjects =>
            prevProjects.map(p => {
                if (p.id === projectId) {
                    return { ...p, data: { ...p.data, ...dataUpdater(p.data) } };
                }
                return p;
            })
        );
    }, []);

    const handleAddProject = (newProjectData: Omit<Project, 'id'>) => {
        const newProject: Project = { id: `proj-${Date.now()}`, ...newProjectData };
        setProjects(prev => [...prev, newProject]);
        setActiveProjectId(newProject.id);
        setActiveView('dashboard');
        setIsProjectModalOpen(false);
    };
    
    const handleUpdateFinancials = useCallback((projectId: string, newFinancials: FinancialItem[], fileName?: string) => {
        updateProjectData(projectId, () => ({
            financials: newFinancials,
            ...(fileName && { contractualBOQFile: fileName }),
        }));
    }, [updateProjectData]);

    const handleUpdateSchedule = useCallback((projectId: string, newSchedule: ScheduleTask[]) => {
        updateProjectData(projectId, () => ({ schedule: newSchedule }));
    }, [updateProjectData]);

    const handleUpdateRisks = useCallback((projectId: string, newRisks: Risk[]) => {
        updateProjectData(projectId, () => ({ riskRegister: newRisks }));
    }, [updateProjectData]);
    
    const handleUpdateSiteLog = useCallback((projectId: string, newLog: SiteLogEntry[]) => {
        updateProjectData(projectId, () => ({ siteLog: newLog }));
    }, [updateProjectData]);

    const handleUpdateWorkLog = useCallback((projectId: string, newLog: WorkLogEntry[]) => {
        updateProjectData(projectId, () => ({ workLog: newLog }));
    }, [updateProjectData]);
    
    const handleUpdateChecklists = useCallback((projectId: string, newChecklists: ChecklistItem[]) => {
        updateProjectData(projectId, () => ({ checklists: newChecklists }));
    }, [updateProjectData]);
    
    const handleUpdateDrawings = useCallback((projectId: string, newDrawings: Drawing[], newFolders: DrawingFolder[]) => {
        updateProjectData(projectId, () => ({ drawings: newDrawings, drawingFolders: newFolders }));
    }, [updateProjectData]);

    const handleUpdateDocuments = useCallback((projectId: string, newDocs: DocumentCategory[]) => {
        updateProjectData(projectId, () => ({ engineeringDocs: newDocs }));
    }, [updateProjectData]);
    
    const handleUpdatePurchaseOrders = useCallback((projectId: string, newOrders: PurchaseOrder[]) => {
        updateProjectData(projectId, () => ({ purchaseOrders: newOrders }));
    }, [updateProjectData]);

    const handleUpdateItems = useCallback((projectId: string, newItems: ProjectItem[]) => {
        updateProjectData(projectId, () => ({ items: newItems }));
    }, [updateProjectData]);

    const handleUpdateObjectives = useCallback((projectId: string, objectives: Objective[]) => {
        updateProjectData(projectId, () => ({ objectives }));
    }, [updateProjectData]);

    const handleUpdateKeyResults = useCallback((projectId: string, keyResults: KeyResult[]) => {
        updateProjectData(projectId, () => ({ keyResults }));
    }, [updateProjectData]);

    const handleUpdateWorkflow = useCallback((projectId: string, newWorkflow: Partial<ProjectWorkflow>) => {
        updateProjectData(projectId, data => ({ workflow: { ...data.workflow, ...newWorkflow } }));
    }, [updateProjectData]);
    
    const handleUpdateBoqReconciliation = useCallback((projectId: string, newMatches: BOQMatch[]) => {
        updateProjectData(projectId, () => ({ boqReconciliation: newMatches }));
    }, [updateProjectData]);

    const handleUpdateComparativeAnalysis = useCallback((projectId: string, newReport: string) => {
        updateProjectData(projectId, () => ({ comparativeAnalysisReport: newReport }));
    }, [updateProjectData]);
    
    const handleUpdateAssistantSettings = useCallback((projectId: string, newSettings: AssistantSettings) => {
        updateProjectData(projectId, () => ({ assistantSettings: newSettings }));
    }, [updateProjectData]);

    const handleUpdateSubcontractors = useCallback((projectId: string, newSubcontractors: Subcontractor[]) => {
        updateProjectData(projectId, () => ({ subcontractors: newSubcontractors }));
    }, [updateProjectData]);

    const handleUpdateSubcontractorInvoices = useCallback((projectId: string, newInvoices: SubcontractorInvoice[]) => {
        updateProjectData(projectId, () => ({ subcontractorInvoices: newInvoices }));
    }, [updateProjectData]);

    const handleUpdateAssessments = useCallback((projectId: string, newAssessments: StructuralAssessment[]) => {
        updateProjectData(projectId, () => ({ structuralAssessments: newAssessments }));
    }, [updateProjectData]);
    
    const handleUpdateMembers = useCallback((projectId: string, newMembers: ProjectMember[]) => {
        updateProjectData(projectId, () => ({ members: newMembers }));
    }, [updateProjectData]);


    // Retry function for error recovery
    const handleRetry = () => {
        setHasError(false);
        setErrorMessage('');
        setIsLoading(true);
        window.location.reload();
    };
    
    const renderView = () => {
        if (!activeProject) {
            return (
                 <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <h2 className="text-2xl font-bold mb-4">لا يوجد مشروع محدد</h2>
                    <p>الرجاء تحديد مشروع من القائمة أو إنشاء مشروع جديد للبدء.</p>
                </div>
            );
        }

        switch (activeView) {
            case 'dashboard':
                return <Dashboard project={activeProject} onSelectView={setActiveView} onUpdateFinancials={handleUpdateFinancials} onUpdateSchedule={handleUpdateSchedule} onUpdateWorkflow={handleUpdateWorkflow} />;
            case 'noufal-backend':
                return <NOUFALBackendHub />;
            case 'schedule':
                return <ScheduleManager project={activeProject} onUpdateSchedule={handleUpdateSchedule} />;
            case 'recovery-plan':
                return <RecoveryPlanner project={activeProject} onUpdateSchedule={handleUpdateSchedule} />;
            case 'financials':
                return <FinancialManager project={activeProject} onUpdatePurchaseOrders={handleUpdatePurchaseOrders} />;
            case 'risks':
                return <RiskManager project={activeProject} onUpdateRisks={handleUpdateRisks} />;
            case 'site':
                return <SiteTracker
                            project={activeProject}
                            onUpdateSiteLog={handleUpdateSiteLog}
                            onUpdateWorkLog={handleUpdateWorkLog}
                            onUpdateChecklists={handleUpdateChecklists}
                            onUpdateSchedule={handleUpdateSchedule}
                        />;
            case 'drawings':
                return <DrawingManager project={activeProject} onUpdateDrawings={handleUpdateDrawings} />;
            case 'docs':
                 return <EngineeringDocsManager project={activeProject} onUpdateDocuments={handleUpdateDocuments} onUpdateFinancials={handleUpdateFinancials} onUpdateSchedule={handleUpdateSchedule} />;
            case 'procurement':
                return <ProcurementManager project={activeProject} onUpdatePurchaseOrders={handleUpdatePurchaseOrders} />;
            case 'subcontractors':
                return <SubcontractorManager project={activeProject} onUpdateSubcontractors={handleUpdateSubcontractors} onUpdateInvoices={handleUpdateSubcontractorInvoices} />;
            case 'members':
                return <ProjectMembers project={activeProject} onUpdateMembers={handleUpdateMembers} />;
            case 'assessments':
                return <AssessmentManager project={activeProject} onUpdateAssessments={handleUpdateAssessments} />;
            case 'hub':
                return <ProjectHub project={activeProject} onUpdateItems={handleUpdateItems} />;
            case 'okrs':
                return <OKRManager project={activeProject} onUpdateObjectives={handleUpdateObjectives} onUpdateKeyResults={handleUpdateKeyResults} />;
            case 'workflow':
                return <WorkflowArchitect project={activeProject} onUpdateWorkflow={handleUpdateWorkflow} />;
            case 'automation':
                return <AutomationCenter />;
            case 'boq-manual':
                return <BOQManualManager 
                    project={activeProject} 
                    onUpdateFinancials={handleUpdateFinancials} 
                    onUpdateSchedule={handleUpdateSchedule} 
                />;
            case 'analysis':
                return <AnalysisCenter project={activeProject} onUpdateBoqReconciliation={handleUpdateBoqReconciliation} onUpdateComparativeAnalysis={handleUpdateComparativeAnalysis} onUpdateFinancials={handleUpdateFinancials} />;
            case 'advanced-reporting':
                return <AdvancedReporting project={activeProject} />;
            case 'assistant':
                return <LiveAssistant project={activeProject} onUpdateSettings={handleUpdateAssistantSettings} />;
            case 'docs-viewer':
                return <DocumentationViewer />;
            case 'audit-log':
                return <AuditLogViewer />;
            case 'engineering-knowledge':
                return <EngineeringKnowledge project={activeProject} />;
            case 'knowledge-database':
                return <KnowledgeDatabase project={activeProject} />;
            case 'block-library':
                return <BlockLibrary />;
            case 'boq-upload-hub':
                return <BOQUploadHub projectId={activeProject.id} projectName={activeProject.name} />;
            case 'sbc-compliance':
                return <SBCComplianceChecker />;
            case 'schedule-analysis':
                return <ScheduleAnalysis project={activeProject} />;
            case 'noufal-command':
                return <NOUFALCommandCenter />;
            case 'library-showcase':
                return <LibraryShowcase />;
            case 'manual-analysis':
                return <ManualAnalysisMode />;
            case 'quantities-extraction':
                return <QuantitiesExtractionPage />;
            case 'noufal-enhanced':
                return <NOUFALEnhanced />;
            case 'smart-reports':
                return <SmartReportsSystem />;
            case 'ai-features':
                return <AdvancedAIFeatures />;
            case 'pro-engineering':
                return <ProEngineeringHub projectId={activeProject.id} projectName={activeProject.name} />;
            case 'real-ai':
                return <RealAIProcessor projectId={activeProject.id} projectName={activeProject.name} />;
            case 'noufal-integrated':
                return <NOUFALIntegratedSystem />;
            case 'primavera-magic':
                return <PrimaveraMagicRouter />;
            case 'executive-dashboard':
                return <ExecutiveDashboard projectId={activeProject.id} projectName={activeProject.name} />;
            case 'resources-manager':
                return <ResourceManagement projectId={activeProject.id} />;
            case 'cost-control':
                return <CostControlSystem projectId={activeProject.id} totalBudget={activeProject.data.financials.reduce((sum, item) => sum + item.total, 0)} />;
            case 'integrated-analytics':
                return <IntegratedAnalytics projectId={activeProject.id} />;
            // Advanced Construction Systems
            case 'advanced-dashboard':
                return <AdvancedDashboard />;
            case 'advanced-analytics':
                return <AdvancedAnalytics />;
            case 'interactive-reports':
                return <InteractiveReports />;
            case 'mobile-field-hub':
                return <MobileFieldHub />;
            case 'rfi-manager':
                return <RFIManager />;
            case 'design-execution':
                return <DesignExecutionManager />;
            case 'integration-monitor':
                return <IntegrationMonitor />;
            case 'pdf-manager':
                return <PDFManager />;
            case 'theme-customizer':
                return <ThemeCustomizer />;
            case 'cad-platform':
                return <CADUnifiedPlatform />;
            default:
                return <Dashboard project={activeProject} onSelectView={setActiveView} onUpdateFinancials={handleUpdateFinancials} onUpdateSchedule={handleUpdateSchedule} onUpdateWorkflow={handleUpdateWorkflow} />;
        }
    };

    // Show error fallback if there's an error
    if (hasError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900 p-8">
                <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
                    <div className="text-6xl mb-6">⚠️</div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">حدث خطأ في التحميل</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{errorMessage}</p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={handleRetry}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
                        >
                            🔄 إعادة المحاولة
                        </button>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.reload();
                            }}
                            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
                        >
                            🗑️ مسح البيانات وإعادة التشغيل
                        </button>
                    </div>
                    <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-right">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">💡 نصائح لحل المشكلة:</h3>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                            <li>• تأكد من اتصالك بالإنترنت</li>
                            <li>• قم بتحديث المتصفح</li>
                            <li>• امسح الذاكرة المؤقتة (Cache)</li>
                            <li>• جرب متصفح آخر</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
    
    // Show loading screen
    if (isLoading) {
        return <LoadingSpinner />;
    }
    
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
            {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
            <Sidebar
                projects={projects}
                activeProjectId={activeProjectId}
                onSelectProject={setActiveProjectId}
                activeView={activeView}
                onSelectView={setActiveView}
                onAddProject={() => setIsProjectModalOpen(true)}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isDesktopCollapsed={isDesktopSidebarCollapsed}
                onToggleDesktopCollapse={() => setIsDesktopSidebarCollapsed(prev => !prev)}
            />
             <div className="flex-1 flex flex-col overflow-hidden">
                <header className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 shrink-0 z-20">
                    <h1 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 truncate">
                        {activeProject?.name || 'AN.AI'}
                    </h1>
                    <button onClick={() => setIsSidebarOpen(true)} className="p-1">
                        <Menu size={24} />
                    </button>
                </header>
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <Suspense fallback={<LoadingSpinner />}>
                        {renderView()}
                    </Suspense>
                </main>
            </div>
             <ProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                onAddProject={handleAddProject}
            />
        </div>
    );
};

export default App;