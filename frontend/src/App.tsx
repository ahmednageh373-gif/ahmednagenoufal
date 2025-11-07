/**
 * NOUFAL Engineering Management System
 * Main Application Component - Enhanced Version 2.0
 * 
 * @author NOUFAL EMS
 * @date 2025-11-07
 * @version 2.0
 * 
 * New Features:
 * - Advanced Analytics Dashboard
 * - Real-time Notification System
 * - Document Management System
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
  X
} from 'lucide-react';

type AppView = 
  | 'dashboard' 
  | 'quick-tools' 
  | 'house-plans' 
  | 'engineering-tools'
  | 'analytics'
  | 'documents';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigationItems = [
    { id: 'dashboard' as AppView, label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, color: 'text-blue-600' },
    { id: 'analytics' as AppView, label: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, color: 'text-purple-600', badge: 'NEW' },
    { id: 'documents' as AppView, label: 'Documents', icon: <FolderOpen className="w-5 h-5" />, color: 'text-green-600', badge: 'NEW' },
    { id: 'quick-tools' as AppView, label: 'Quick Tools', icon: <Zap className="w-5 h-5" />, color: 'text-yellow-600' },
    { id: 'house-plans' as AppView, label: 'House Plans', icon: <HomeIcon className="w-5 h-5" />, color: 'text-indigo-600' },
    { id: 'engineering-tools' as AppView, label: 'Engineering Tools', icon: <Wrench className="w-5 h-5" />, color: 'text-red-600' },
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
              ${sidebarOpen ? 'w-64' : 'w-20'} 
              bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
              transition-all duration-300 flex flex-col
            `}
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              {sidebarOpen && (
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">NOUFAL EMS</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">v2.0 Enhanced</p>
                </div>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors
                    ${currentView === item.id
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <span className={currentView === item.id ? 'text-indigo-600 dark:text-indigo-400' : item.color}>
                    {item.icon}
                  </span>
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
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
                    {navigationItems.find(item => item.id === currentView)?.label}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {currentView === 'analytics' && 'Real-time project insights and AI-powered recommendations'}
                    {currentView === 'documents' && 'Manage, organize, and collaborate on project documents'}
                    {currentView === 'dashboard' && 'Your centralized engineering management hub'}
                    {currentView === 'quick-tools' && 'Fast access to commonly used tools'}
                    {currentView === 'house-plans' && 'Extract and analyze architectural plans'}
                    {currentView === 'engineering-tools' && 'Professional engineering calculators and tools'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Search Bar */}
                  <div className="relative hidden md:block">
                    <input
                      type="text"
                      placeholder="Search..."
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
};

export default App;
