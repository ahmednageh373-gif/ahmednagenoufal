import React, { useState } from 'react';
// Fix: Correct import path for types.
import type { Project } from '../types';
import { ChevronDown, Plus, LayoutDashboard, GanttChartSquare, DollarSign, ShieldAlert, Camera, DraftingCompass, FileText, ShoppingCart, LayoutGrid, Target, Pyramid, BrainCircuit, Mic, HelpCircle, Moon, Sun, X, Users, Undo2, ClipboardCheck, History, BarChart3 } from 'lucide-react';

interface SidebarProps {
    projects: Project[];
    activeProjectId: string | null;
    onSelectProject: (id: string) => void;
    activeView: string;
    onSelectView: (view: string) => void;
    onAddProject: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const NavItem: React.FC<{ icon: React.ElementType; label: string; viewName: string; activeView: string; onSelect: (view: string) => void }> = ({ icon: Icon, label, viewName, activeView, onSelect }) => (
    <button
        onClick={() => onSelect(viewName)}
        className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeView === viewName
                ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
        }`}
    >
        <Icon size={18} />
        <span>{label}</span>
    </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ projects, activeProjectId, onSelectProject, activeView, onSelectView, onAddProject, isOpen, onClose }) => {
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
    
    const selectedProject = projects.find(p => p.id === activeProjectId);

    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark');
    };

    const handleSelectView = (view: string) => {
        onSelectView(view);
        onClose();
    };

    const handleSelectProject = (id: string) => {
        onSelectProject(id);
        setIsProjectDropdownOpen(false);
        onClose();
    };

    const handleAddProjectClick = () => {
        onAddProject();
        setIsProjectDropdownOpen(false);
    };

    return (
        <>
            <aside className={`w-72 bg-white dark:bg-gray-900/70 border-l border-gray-200 dark:border-gray-800 flex flex-col p-4 shrink-0 rtl transition-transform duration-300 ease-in-out
                fixed top-0 right-0 h-full z-40
                lg:relative lg:translate-x-0
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 text-center">AN.AI</h1>
                     <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                        <X size={24} />
                    </button>
                </div>

                <div className="relative mb-4">
                    <button
                        onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                        className="w-full bg-gray-100 dark:bg-gray-800 p-3 rounded-lg flex justify-between items-center"
                    >
                        <span className="font-semibold truncate">{selectedProject?.name || 'اختر مشروعًا'}</span>
                        <ChevronDown size={20} className={`transition-transform ${isProjectDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isProjectDropdownOpen && (
                        <div className="absolute top-full right-0 mt-2 w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-10">
                            {projects.map(project => (
                                <button
                                    key={project.id}
                                    onClick={() => handleSelectProject(project.id)}
                                    className="w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    {project.name}
                                </button>
                            ))}
                            <button
                                onClick={handleAddProjectClick}
                                className="w-full flex items-center gap-2 px-4 py-2 text-indigo-600 dark:text-indigo-400 border-t dark:border-gray-700"
                            >
                                <Plus size={16} /> إضافة مشروع جديد
                            </button>
                        </div>
                    )}
                </div>

                <nav className="flex-grow space-y-1.5 overflow-y-auto">
                    <NavItem icon={LayoutDashboard} label="لوحة التحكم" viewName="dashboard" activeView={activeView} onSelect={handleSelectView} />
                    <NavItem icon={GanttChartSquare} label="الجدول الزمني" viewName="schedule" activeView={activeView} onSelect={handleSelectView} />
                    <NavItem icon={Undo2} label="خطة التعافي" viewName="recovery-plan" activeView={activeView} onSelect={handleSelectView} />
                    <NavItem icon={DollarSign} label="الإدارة المالية" viewName="financials" activeView={activeView} onSelect={handleSelectView} />
                    <NavItem icon={ShieldAlert} label="إدارة المخاطر" viewName="risks" activeView={activeView} onSelect={handleSelectView} />
                    <NavItem icon={Camera} label="متابعة الموقع" viewName="site" activeView={activeView} onSelect={handleSelectView} />
                    <NavItem icon={DraftingCompass} label="المخططات" viewName="drawings" activeView={activeView} onSelect={handleSelectView} />
                    <NavItem icon={FileText} label="المستندات الهندسية" viewName="docs" activeView={activeView} onSelect={handleSelectView} />
                    <NavItem icon={ShoppingCart} label="المشتريات" viewName="procurement" activeView={activeView} onSelect={handleSelectView} />
                    <NavItem icon={Users} label="مقاولي الباطن" viewName="subcontractors" activeView={activeView} onSelect={handleSelectView} />
                    <NavItem icon={ClipboardCheck} label="التقييم والترميم" viewName="assessments" activeView={activeView} onSelect={handleSelectView} />
                    <NavItem icon={LayoutGrid} label="مركز المشروع" viewName="hub" activeView={activeView} onSelect={handleSelectView} />
                    <NavItem icon={Target} label="الأهداف (OKRs)" viewName="okrs" activeView={activeView} onSelect={handleSelectView} />
                    <NavItem icon={Pyramid} label="هيكلة العمل" viewName="workflow" activeView={activeView} onSelect={handleSelectView} />
                    <NavItem icon={BrainCircuit} label="مركز التحليل (AI)" viewName="analysis" activeView={activeView} onSelect={handleSelectView} />
                    <NavItem icon={BarChart3} label="التقارير المتقدمة" viewName="advanced-reporting" activeView={activeView} onSelect={handleSelectView} />
                    <NavItem icon={Mic} label="المساعد المباشر" viewName="assistant" activeView={activeView} onSelect={handleSelectView} />
                    <NavItem icon={History} label="سجل التدقيق" viewName="audit-log" activeView={activeView} onSelect={handleSelectView} />
                </nav>

                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                    <NavItem icon={HelpCircle} label="المساعدة والتوثيق" viewName="docs-viewer" activeView={activeView} onSelect={handleSelectView} />
                    <div className="flex items-center justify-center p-2">
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <button onClick={toggleTheme} className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                             <span className="sr-only">Toggle theme</span>
                        </button>
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </div>
                </div>
            </aside>
        </>
    );
};
