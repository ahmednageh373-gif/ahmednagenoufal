import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { Sidebar } from './components/Sidebar';
import { Menu } from 'lucide-react';
import { ProjectModal } from './components/ProjectModal';
import { mockProjects } from './data/mockData';
// Fix: Correct import path for types.
import type { Project, ProjectItem, PurchaseOrder, Objective, KeyResult, ProjectWorkflow, FinancialItem, ScheduleTask, Risk, SiteLogEntry, Drawing, DrawingFolder, DocumentCategory, BOQMatch, AssistantSettings, Subcontractor, SubcontractorInvoice, StructuralAssessment } from './types';

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
const AnalysisCenter = React.lazy(() => import('./components/AnalysisCenter').then(module => ({ default: module.AnalysisCenter })));
const LiveAssistant = React.lazy(() => import('./components/LiveAssistant').then(module => ({ default: module.LiveAssistant })));
const DocumentationViewer = React.lazy(() => import('./components/DocumentationViewer').then(module => ({ default: module.DocumentationViewer })));
const RecoveryPlanner = React.lazy(() => import('./components/RecoveryPlanner').then(module => ({ default: module.RecoveryPlanner })));
const AssessmentManager = React.lazy(() => import('./components/AssessmentManager').then(module => ({ default: module.AssessmentManager })));
const AuditLogViewer = React.lazy(() => import('./components/AuditLogViewer').then(module => ({ default: module.AuditLogViewer })));
const AdvancedReporting = React.lazy(() => import('./components/AdvancedReporting'));

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
);


const App: React.FC = () => {
    // Lazy initialize state from localStorage
    const [projects, setProjects] = useState<Project[]>(() => {
        try {
            const savedProjects = localStorage.getItem('AN_AI_PROJECTS');
            if (savedProjects) {
                return JSON.parse(savedProjects);
            }
        } catch (error) {
            console.error("Could not load projects from local storage", error);
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
            case 'schedule':
                return <ScheduleManager project={activeProject} onUpdateSchedule={handleUpdateSchedule} />;
            case 'recovery-plan':
                return <RecoveryPlanner project={activeProject} onUpdateSchedule={handleUpdateSchedule} />;
            case 'financials':
                return <FinancialManager project={activeProject} onUpdatePurchaseOrders={handleUpdatePurchaseOrders} />;
            case 'risks':
                return <RiskManager project={activeProject} onUpdateRisks={handleUpdateRisks} />;
            case 'site':
                return <SiteTracker project={activeProject} onUpdateSiteLog={handleUpdateSiteLog} />;
            case 'drawings':
                return <DrawingManager project={activeProject} onUpdateDrawings={handleUpdateDrawings} />;
            case 'docs':
                 return <EngineeringDocsManager project={activeProject} onUpdateDocuments={handleUpdateDocuments} onUpdateFinancials={handleUpdateFinancials} onUpdateSchedule={handleUpdateSchedule} />;
            case 'procurement':
                return <ProcurementManager project={activeProject} onUpdatePurchaseOrders={handleUpdatePurchaseOrders} />;
            case 'subcontractors':
                return <SubcontractorManager project={activeProject} onUpdateSubcontractors={handleUpdateSubcontractors} onUpdateInvoices={handleUpdateSubcontractorInvoices} />;
            case 'assessments':
                return <AssessmentManager project={activeProject} onUpdateAssessments={handleUpdateAssessments} />;
            case 'hub':
                return <ProjectHub project={activeProject} onUpdateItems={handleUpdateItems} />;
            case 'okrs':
                return <OKRManager project={activeProject} onUpdateObjectives={handleUpdateObjectives} onUpdateKeyResults={handleUpdateKeyResults} />;
            case 'workflow':
                return <WorkflowArchitect project={activeProject} onUpdateWorkflow={handleUpdateWorkflow} />;
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
            default:
                return <Dashboard project={activeProject} onSelectView={setActiveView} onUpdateFinancials={handleUpdateFinancials} onUpdateSchedule={handleUpdateSchedule} onUpdateWorkflow={handleUpdateWorkflow} />;
        }
    };

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