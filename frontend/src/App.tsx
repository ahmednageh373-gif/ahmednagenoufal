/**
 * NOUFAL Engineering Management System
 * Main Application Component
 * 
 * @author NOUFAL EMS
 * @date 2025-11-04
 * @version 1.0
 */

import React, { useState } from 'react';
import UnifiedDashboard from './components/UnifiedDashboard';
import { QuickTools } from './components/QuickTools';
import { HousePlanExtractor } from './components/HousePlanExtractor';
import ToolsPanel from './components/tools/ToolsPanel';

type AppView = 'dashboard' | 'quick-tools' | 'house-plans' | 'engineering-tools';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <UnifiedDashboard />;
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
    <div className="app">
      {renderView()}
    </div>
  );
};

export default App;
