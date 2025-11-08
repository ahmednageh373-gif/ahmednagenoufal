/**
 * NOUFAL Engineering Management System
 * Main Application Component - Enhanced Version 2.1
 * 
 * @author NOUFAL EMS
 * @date 2025-11-07
 * @version 2.1
 * 
 * New Features:
 * - Organized sidebar with collapsible sections
 * - Grouped pages by category
 * - Better navigation structure
 */

import React, { useState } from 'react';
import UnifiedDashboard from './components/UnifiedDashboard';
import { QuickTools } from './components/QuickTools';
import { HousePlanExtractor } from './components/HousePlanExtractor';
import ToolsPanel from './components/tools/ToolsPanel';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import { DocumentManager } from './components/DocumentManager';
import { NotificationCenter } from './components/NotificationCenter';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import {
  LayoutDashboard,
  Zap,
  Home as HomeIcon,
  Wrench,
  BarChart3,
  FolderOpen,
  Settings,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  FileText,
  Calendar,
  DollarSign,
  Package,
  Users,
  Building2,
  TrendingUp,
  ShoppingCart,
  ClipboardList,
  Folder,
  Image,
  Target,
  Activity
} from 'lucide-react';

type AppView = 
  | 'dashboard' 
  | 'quick-tools' 
  | 'house-plans' 
  | 'engineering-tools'
  | 'analytics'
  | 'documents'
  // Executive Management
  | 'financial-manager'
  | 'schedule-manager'
  | 'procurement-manager'
  // Resources & Files
  | 'drawing-manager'
  | 'site-tracker'
  | 'resources-manager'
  // Analytics & Reports
  | 'reports'
  | 'okr-manager'
  | 'risk-manager';

interface NavSection {
  id: string;
  title: string;
  titleAr: string;
  icon: React.ReactNode;
  color: string;
  pages: NavPage[];
}

interface NavPage {
  id: AppView;
  label: string;
  labelAr: string;
  icon: React.ReactNode;
  badge?: string;
}

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>(['main', 'executive']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const navigationSections: NavSection[] = [
    {
      id: 'main',
      title: 'Main',
      titleAr: 'الرئيسية',
      icon: <LayoutDashboard className="w-5 h-5" />,
      color: 'text-blue-600',
      pages: [
        { id: 'dashboard', label: 'Dashboard', labelAr: 'لوحة التحكم', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'analytics', label: 'Analytics', labelAr: 'التحليلات', icon: <BarChart3 className="w-4 h-4" />, badge: 'NEW' },
      ]
    },
    {
      id: 'executive',
      title: 'Executive Management',
      titleAr: 'الإدارة التنفيذية',
      icon: <Building2 className="w-5 h-5" />,
      color: 'text-purple-600',
      pages: [
        { id: 'financial-manager', label: 'Financial Manager', labelAr: 'الإدارة المالية', icon: <DollarSign className="w-4 h-4" /> },
        { id: 'schedule-manager', label: 'Schedule Manager', labelAr: 'الجداول الزمنية', icon: <Calendar className="w-4 h-4" /> },
        { id: 'procurement-manager', label: 'Procurement', labelAr: 'إدارة المشتريات', icon: <ShoppingCart className="w-4 h-4" /> },
        { id: 'okr-manager', label: 'OKR & Goals', labelAr: 'الأهداف والنتائج', icon: <Target className="w-4 h-4" /> },
      ]
    },
    {
      id: 'resources',
      title: 'Resources & Files',
      titleAr: 'الموارد والملفات',
      icon: <FolderOpen className="w-5 h-5" />,
      color: 'text-green-600',
      pages: [
        { id: 'documents', label: 'Documents', labelAr: 'إدارة المستندات', icon: <FileText className="w-4 h-4" />, badge: 'NEW' },
        { id: 'drawing-manager', label: 'Drawings', labelAr: 'المخططات الهندسية', icon: <Image className="w-4 h-4" /> },
        { id: 'site-tracker', label: 'Site Tracker', labelAr: 'متابعة الموقع', icon: <Activity className="w-4 h-4" /> },
        { id: 'resources-manager', label: 'Resources', labelAr: 'إدارة الموارد', icon: <Package className="w-4 h-4" /> },
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      titleAr: 'التحليلات والتقارير',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-orange-600',
      pages: [
        { id: 'reports', label: 'Smart Reports', labelAr: 'التقارير الذكية', icon: <ClipboardList className="w-4 h-4" /> },
        { id: 'risk-manager', label: 'Risk Management', labelAr: 'إدارة المخاطر', icon: <Activity className="w-4 h-4" /> },
      ]
    },
    {
      id: 'tools',
      title: 'Tools & Utilities',
      titleAr: 'الأدوات والمساعدات',
      icon: <Wrench className="w-5 h-5" />,
      color: 'text-indigo-600',
      pages: [
        { id: 'quick-tools', label: 'Quick Tools', labelAr: 'أدوات سريعة', icon: <Zap className="w-4 h-4" /> },
        { id: 'house-plans', label: 'House Plans', labelAr: 'مخططات المنازل', icon: <HomeIcon className="w-4 h-4" /> },
        { id: 'engineering-tools', label: 'Engineering Tools', labelAr: 'أدوات هندسية', icon: <Wrench className="w-4 h-4" /> },
      ]
    }
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <UnifiedDashboard />;
      case 'analytics':
        return <AdvancedAnalytics />;
      case 'documents':
        return <DocumentManager />;
      case 'quick-tools':
        return <QuickTools />;
      case 'house-plans':
        return <HousePlanExtractor />;
      case 'engineering-tools':
        return <ToolsPanel />;
      // Placeholders for other pages
      case 'financial-manager':
        return <PlaceholderPage title="Financial Manager" titleAr="الإدارة المالية" icon={<DollarSign className="w-12 h-12" />} />;
      case 'schedule-manager':
        return <PlaceholderPage title="Schedule Manager" titleAr="الجداول الزمنية" icon={<Calendar className="w-12 h-12" />} />;
      case 'procurement-manager':
        return <PlaceholderPage title="Procurement Manager" titleAr="إدارة المشتريات" icon={<ShoppingCart className="w-12 h-12" />} />;
      case 'drawing-manager':
        return <PlaceholderPage title="Drawing Manager" titleAr="المخططات الهندسية" icon={<Image className="w-12 h-12" />} />;
      case 'site-tracker':
        return <PlaceholderPage title="Site Tracker" titleAr="متابعة الموقع" icon={<Activity className="w-12 h-12" />} />;
      case 'resources-manager':
        return <PlaceholderPage title="Resources Manager" titleAr="إدارة الموارد" icon={<Package className="w-12 h-12" />} />;
      case 'reports':
        return <PlaceholderPage title="Smart Reports" titleAr="التقارير الذكية" icon={<ClipboardList className="w-12 h-12" />} />;
      case 'okr-manager':
        return <PlaceholderPage title="OKR & Goals" titleAr="الأهداف والنتائج" icon={<Target className="w-12 h-12" />} />;
      case 'risk-manager':
        return <PlaceholderPage title="Risk Management" titleAr="إدارة المخاطر" icon={<Activity className="w-12 h-12" />} />;
      default:
        return <UnifiedDashboard />;
    }
  };

  return (
    <ThemeProvider>
      <NotificationProvider>
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
          {/* Sidebar */}
          <div 
            className={`
              ${sidebarOpen ? 'w-72' : 'w-20'} 
              bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
              transition-all duration-300 flex flex-col overflow-hidden
            `}
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              {sidebarOpen && (
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">NOUFAL EMS</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">v2.1 Organized</p>
                </div>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Navigation Sections */}
            <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
              {navigationSections.map((section) => (
                <div key={section.id} className="mb-2">
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 rounded-lg 
                      hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                      ${!sidebarOpen && 'justify-center'}
                    `}
                  >
                    <span className={section.color}>
                      {section.icon}
                    </span>
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {section.titleAr}
                        </span>
                        {expandedSections.includes(section.id) ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </>
                    )}
                  </button>

                  {/* Section Pages */}
                  {expandedSections.includes(section.id) && (
                    <div className={`${sidebarOpen ? 'ml-4 mt-1 space-y-1' : 'mt-1 space-y-1'}`}>
                      {section.pages.map((page) => (
                        <button
                          key={page.id}
                          onClick={() => setCurrentView(page.id)}
                          className={`
                            w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
                            ${currentView === page.id
                              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }
                            ${!sidebarOpen && 'justify-center'}
                          `}
                        >
                          <span className={currentView === page.id ? 'text-indigo-600 dark:text-indigo-400' : ''}>
                            {page.icon}
                          </span>
                          {sidebarOpen && (
                            <>
                              <span className="flex-1 text-left text-sm">
                                {page.labelAr}
                              </span>
                              {page.badge && (
                                <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded">
                                  {page.badge}
                                </span>
                              )}
                            </>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                  A
                </div>
                {sidebarOpen && (
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Admin User</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">admin@noufal.com</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Bar */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {getCurrentPageTitle()}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {getCurrentPageDescription()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Search Bar */}
                  <div className="relative hidden md:block">
                    <input
                      type="text"
                      placeholder="بحث..."
                      className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      🔍
                    </span>
                  </div>

                  {/* Notification Center */}
                  <NotificationCenter />

                  {/* Settings Button */}
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Settings className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* View Content */}
            <div className="flex-1 overflow-auto">
              {renderView()}
            </div>
          </div>
        </div>
      </NotificationProvider>
    </ThemeProvider>
  );

  function getCurrentPageTitle(): string {
    for (const section of navigationSections) {
      const page = section.pages.find(p => p.id === currentView);
      if (page) return page.labelAr;
    }
    return 'لوحة التحكم';
  }

  function getCurrentPageDescription(): string {
    const descriptions: Record<AppView, string> = {
      'dashboard': 'مركزك الرئيسي لإدارة المشاريع الهندسية',
      'analytics': 'رؤى في الوقت الفعلي وتوصيات مدعومة بالذكاء الاصطناعي',
      'documents': 'إدارة وتنظيم والتعاون على مستندات المشروع',
      'quick-tools': 'وصول سريع للأدوات الشائعة',
      'house-plans': 'استخراج وتحليل المخططات المعمارية',
      'engineering-tools': 'حاسبات وأدوات هندسية احترافية',
      'financial-manager': 'إدارة المقايسات والميزانيات والتكاليف',
      'schedule-manager': 'تخطيط ومتابعة الجداول الزمنية',
      'procurement-manager': 'إدارة المشتريات والموردين والطلبات',
      'drawing-manager': 'إدارة المخططات الهندسية والرسومات',
      'site-tracker': 'متابعة الموقع وتوثيق التقدم',
      'resources-manager': 'إدارة الموارد والمعدات والمواد',
      'reports': 'تقارير ذكية وتحليلات شاملة',
      'okr-manager': 'إدارة الأهداف والنتائج الرئيسية',
      'risk-manager': 'تحليل وإدارة المخاطر',
    };
    return descriptions[currentView] || '';
  }
};

// Placeholder component for pages under development
const PlaceholderPage: React.FC<{ title: string; titleAr: string; icon: React.ReactNode }> = ({ title, titleAr, icon }) => {
  return (
    <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="flex justify-center mb-4 text-gray-400">
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {titleAr}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {title}
        </p>
        <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg">
          🚧 قيد التطوير - Coming Soon
        </div>
      </div>
    </div>
  );
};

export default App;
