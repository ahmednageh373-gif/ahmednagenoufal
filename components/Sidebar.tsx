import React, { useState } from 'react';
// Fix: Correct import path for types.
import type { Project } from '../types';
import { ChevronDown, Plus, LayoutDashboard, GanttChartSquare, DollarSign, ShieldAlert, Camera, Compass as DraftingCompass, FileText, ShoppingCart, LayoutGrid, Target, Pyramid, BrainCircuit, Mic, HelpCircle, Moon, Sun, X, Users, Undo2, ClipboardCheck, History, BarChart3, HardHat, ChevronsRight, Building2, Table, GraduationCap, Database, Server, Zap, Workflow, Package, Upload, Shield, Edit3, Layers, Brain, Sparkles, Briefcase, TrendingUp, PieChart, Hammer, Compass, Box, File, Palette, ChevronRight, Calculator, Ruler, FileUp, BookOpen, Home } from 'lucide-react';

interface SidebarProps {
    projects: Project[];
    activeProjectId: string | null;
    onSelectProject: (id: string) => void;
    activeView: string;
    onSelectView: (view: string) => void;
    onAddProject: () => void;
    isOpen: boolean;
    onClose: () => void;
    isDesktopCollapsed: boolean;
    onToggleDesktopCollapse: () => void;
}

const NavItem: React.FC<{ icon: React.ElementType; label: string; viewName: string; activeView: string; onSelect: (view: string) => void; isCollapsed: boolean; indent?: boolean }> = ({ icon: Icon, label, viewName, activeView, onSelect, isCollapsed, indent = false }) => (
    <button
        onClick={() => onSelect(viewName)}
        title={isCollapsed ? label : undefined}
        className={`w-full flex items-center gap-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            indent ? 'pr-4 pl-8' : 'px-4'
        } ${
            activeView === viewName
                ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
        } ${isCollapsed ? 'lg:justify-center' : ''}`}
    >
        <Icon size={indent ? 18 : 20} className="shrink-0" />
        <span className={`whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100'}`}>
            {label}
        </span>
    </button>
);

interface NavSectionProps {
    title: string;
    icon: React.ElementType;
    isCollapsed: boolean;
    children: React.ReactNode;
}

const NavSection: React.FC<NavSectionProps> = ({ title, icon: Icon, isCollapsed, children }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    return (
        <div className="mb-2">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-extrabold text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100 transition-colors rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 ${
                    isCollapsed ? 'lg:justify-center' : ''
                }`}
            >
                <Icon size={20} className="shrink-0" />
                <span className={`flex-1 text-right transition-opacity duration-200 ${isCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100'}`}>
                    {title}
                </span>
                <ChevronRight 
                    size={16} 
                    className={`shrink-0 transition-all duration-200 ${isExpanded ? 'rotate-90' : ''} ${isCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100'}`}
                />
            </button>
            <div className={`space-y-0.5 overflow-hidden transition-all duration-300 ${
                isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
                {children}
            </div>
        </div>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({ projects, activeProjectId, onSelectProject, activeView, onSelectView, onAddProject, isOpen, onClose, isDesktopCollapsed, onToggleDesktopCollapse }) => {
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
            <aside className={`bg-white dark:bg-gray-900/70 border-l border-gray-200 dark:border-gray-800 flex flex-col p-4 shrink-0 rtl transition-all duration-300 ease-in-out
                fixed top-0 right-0 h-full z-40
                lg:relative lg:translate-x-0
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                ${isDesktopCollapsed ? 'lg:w-20' : 'lg:w-72'}`}>
                
                <div className="flex justify-between items-center mb-6 relative">
                    <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 w-full text-center relative overflow-hidden h-8">
                        <span className={`transition-opacity duration-200 whitespace-nowrap ${isDesktopCollapsed ? 'lg:opacity-0' : 'opacity-100'}`}>AN.AI</span>
                        <span className={`absolute top-0 right-1/2 translate-x-1/2 transition-opacity duration-200 ${isDesktopCollapsed ? 'lg:opacity-100' : 'lg:opacity-0'}`}>A</span>
                    </h1>
                     <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 absolute right-0 top-1/2 -translate-y-1/2">
                        <X size={24} />
                    </button>
                </div>

                <div className="relative mb-4">
                    <button
                        onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                        className="w-full bg-gray-100 dark:bg-gray-800 p-3 rounded-lg flex justify-between items-center"
                    >
                        <span className={`font-semibold truncate transition-opacity duration-200 ${isDesktopCollapsed ? 'lg:opacity-0' : ''}`}>{selectedProject?.name || 'اختر مشروعًا'}</span>
                        <Building2 size={20} className={`absolute right-1/2 translate-x-1/2 transition-opacity duration-200 ${isDesktopCollapsed ? 'lg:opacity-100' : 'lg:opacity-0'}`} />
                        <ChevronDown size={20} className={`transition-transform transition-opacity ${isProjectDropdownOpen ? 'rotate-180' : ''} ${isDesktopCollapsed ? 'lg:opacity-0' : ''}`} />
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

                <nav className="flex-grow space-y-1 overflow-y-auto overflow-x-hidden">
                    {/* الصفحة الرئيسية */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-1 mb-2 border-2 border-indigo-300 dark:border-indigo-700">
                        <NavItem icon={Home} label="🏠 الصفحة الرئيسية" viewName="home" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} />
                    </div>
                    {/* لوحة التحكم الرئيسية */}
                    <NavItem icon={LayoutDashboard} label="لوحة التحكم" viewName="dashboard" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} />
                    
                    {/* إدارة المقايسات والجدول الزمني */}
                    <NavSection title="المقايسات والجدول الزمني" icon={Table} isCollapsed={isDesktopCollapsed}>
                        <NavItem icon={Table} label="إدارة المقايسات" viewName="boq-manual" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={Upload} label="رفع المقايسات" viewName="boq-upload-hub" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={Upload} label="تحليل المقايسات المرفوعة" viewName="boq-analyzer" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={GanttChartSquare} label="الجدول الزمني" viewName="schedule" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={BarChart3} label="تحليل الجدول الزمني" viewName="schedule-analysis" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                    </NavSection>

                    {/* إدارة القيمة المكتسبة (EVM) */}
                    <NavSection title="إدارة القيمة المكتسبة (EVM)" icon={TrendingUp} isCollapsed={isDesktopCollapsed}>
                        <NavItem icon={PieChart} label="لوحة القيمة المكتسبة" viewName="evm-dashboard" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={GanttChartSquare} label="Gantt Chart مع EVM" viewName="evm-gantt" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={FileText} label="التقارير الأسبوعية" viewName="evm-weekly-report" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={ShieldAlert} label="نظام التنبيهات التلقائي" viewName="evm-alerts" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                    </NavSection>

                    {/* المخططات والمستندات */}
                    <NavSection title="المخططات والمستندات" icon={DraftingCompass} isCollapsed={isDesktopCollapsed}>
                        <NavItem icon={Ruler} label="📐 استوديو CAD - دعم DWG" viewName="cad-studio" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={FileUp} label="🔗 مركز تكامل AutoCAD" viewName="autocad-integration" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={Box} label="🏗️ عارض 4D المتكامل" viewName="4d-viewer" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={DraftingCompass} label="🎨 رسم المخططات (CAD)" viewName="cad-platform" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={Sparkles} label="🏗️ استوديو الرسم المعماري AI" viewName="architectural-drawing-studio" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={Package} label="📐 مكتبة YQArch" viewName="block-library" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={Sparkles} label="✨ مكتبة CAD المحسّنة" viewName="enhanced-cad-library" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={DraftingCompass} label="المخططات" viewName="drawings" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={FileText} label="المستندات الهندسية" viewName="docs" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={File} label="إدارة ملفات PDF" viewName="pdf-manager" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                    </NavSection>

                    {/* التنفيذ */}
                    <NavSection title="التنفيذ" icon={Hammer} isCollapsed={isDesktopCollapsed}>
                        <NavItem icon={Compass} label="إدارة التصميم والتنفيذ" viewName="design-execution" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={Camera} label="📸 تفتيش الموقع (AI)" viewName="site-inspection" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={Layers} label="📐 المخططات التنفيذية المعتمدة" viewName="approved-execution-drawings" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={FileText} label="📄 مستندات الموقع" viewName="site-documents" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={Camera} label="متابعة الموقع" viewName="site" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={Sparkles} label="مركز العمليات الميدانية" viewName="mobile-field-hub" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={HardHat} label="مقاولي الباطن" viewName="subcontractors" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={DollarSign} label="الحسابات الهندسية" viewName="financials" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={ClipboardCheck} label="التقييم والترميم" viewName="assessments" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={Shield} label="نظام SBC 2024" viewName="sbc-compliance" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                    </NavSection>
                    
                    {/* إدارة الموارد */}
                    <NavSection title="إدارة الموارد" icon={Package} isCollapsed={isDesktopCollapsed}>
                        <NavItem icon={Hammer} label="إدارة الموارد" viewName="resources-manager" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={Users} label="الموارد البشرية" viewName="resource-management" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                    </NavSection>

                    {/* إدارة المشروعات */}
                    <NavSection title="إدارة المشروعات" icon={Briefcase} isCollapsed={isDesktopCollapsed}>
                        <NavItem icon={Briefcase} label="لوحة التحكم التنفيذية" viewName="executive-dashboard" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={LayoutGrid} label="مركز المشروع" viewName="hub" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={Users} label="أعضاء المشروع" viewName="members" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={Target} label="الأهداف (OKRs)" viewName="okrs" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={Pyramid} label="هيكلة العمل" viewName="workflow" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={ShieldAlert} label="إدارة المخاطر" viewName="risks" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={HelpCircle} label="إدارة طلبات المعلومات" viewName="rfi-manager" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                    </NavSection>

                    {/* مهندس التخطيط */}
                    <NavSection title="مهندس التخطيط" icon={Box} isCollapsed={isDesktopCollapsed}>
                        <NavItem icon={Box} label="Primavera Magic Tools" viewName="primavera-magic" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={Undo2} label="خطة التعافي" viewName="recovery-plan" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={Target} label="لوحة التحكم المتقدمة" viewName="advanced-dashboard" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={TrendingUp} label="التحليلات المتقدمة (EVM)" viewName="advanced-analytics" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                    </NavSection>

                    {/* الإدارة المالية */}
                    <NavSection title="الإدارة المالية" icon={DollarSign} isCollapsed={isDesktopCollapsed}>
                        <NavItem icon={TrendingUp} label="نظام التكاليف" viewName="cost-control" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={PieChart} label="التحليلات المتكاملة" viewName="integrated-analytics" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                    </NavSection>

                    {/* إدارة المشتريات */}
                    <NavSection title="إدارة المشتريات" icon={ShoppingCart} isCollapsed={isDesktopCollapsed}>
                        <NavItem icon={ShoppingCart} label="المشتريات" viewName="procurement" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                    </NavSection>

                    {/* أدوات متقدمة */}
                    <NavSection title="أدوات متقدمة" icon={Zap} isCollapsed={isDesktopCollapsed}>
                        <NavItem icon={Server} label="نظام NOUFAL المتكامل" viewName="noufal-backend" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={Zap} label="NOUFAL المطور 2.0" viewName="noufal-enhanced" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={BrainCircuit} label="مركز قيادة نوفل" viewName="noufal-command" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={Brain} label="مميزات AI المتقدمة" viewName="ai-features" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={Database} label="قاعدة المعرفة للمساعد الذكي" viewName="ai-knowledge-base" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={Zap} label="معالج AI الحقيقي" viewName="real-ai" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={Building2} label="مركز الهندسة الاحترافي" viewName="pro-engineering" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={Calculator} label="🧮 الحاسبات الهندسية (نوفل)" viewName="engineering-calculators" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                    </NavSection>

                    {/* التقارير والتحليلات */}
                    <NavSection title="التقارير والتحليلات" icon={BarChart3} isCollapsed={isDesktopCollapsed}>
                        <NavItem icon={FileText} label="التقارير الذكية" viewName="smart-reports" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={FileText} label="التقارير التفاعلية" viewName="interactive-reports" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={BarChart3} label="التقارير المتقدمة" viewName="advanced-reporting" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={BrainCircuit} label="مركز التحليل (AI)" viewName="analysis" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                    </NavSection>

                    {/* أدوات مساعدة */}
                    <NavSection title="أدوات مساعدة" icon={Mic} isCollapsed={isDesktopCollapsed}>
                        <NavItem icon={Mic} label="المساعد المباشر" viewName="assistant" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={Edit3} label="التحليل اليدوي" viewName="manual-analysis" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={Layers} label="استخراج الكميات" viewName="quantities-extraction" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={GraduationCap} label="المعرفة الهندسية" viewName="engineering-knowledge" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={Database} label="قاعدة البيانات المعرفية" viewName="knowledge-database" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={Package} label="عرض المكتبات" viewName="library-showcase" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                    </NavSection>

                    {/* النظام */}
                    <NavSection title="النظام" icon={Server} isCollapsed={isDesktopCollapsed}>
                        <NavItem icon={Workflow} label="مراقبة التكامل" viewName="integration-monitor" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={History} label="سجل التدقيق" viewName="audit-log" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                        <NavItem icon={Server} label="NOUFAL المتكامل (Backend)" viewName="noufal-integrated" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} indent />
                    </NavSection>
                </nav>

                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                    <NavItem icon={Palette} label="تخصيص المظهر" viewName="theme-customizer" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} />
                    <NavItem icon={HelpCircle} label="المساعدة والتوثيق" viewName="docs-viewer" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} />
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-2 border-2 border-indigo-200 dark:border-indigo-800">
                        <NavItem icon={BookOpen} label="📖 دليل الاستخدام" viewName="how-to-use" activeView={activeView} onSelect={handleSelectView} isCollapsed={isDesktopCollapsed} />
                    </div>
                    <button
                        onClick={onToggleDesktopCollapse}
                        className="hidden lg:flex w-full items-center justify-center py-3 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title={isDesktopCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                    >
                        <ChevronsRight className={`transition-transform duration-300 ${isDesktopCollapsed ? 'rotate-180' : ''}`} />
                    </button>
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
