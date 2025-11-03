import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { SimpleApp } from './SimpleApp';
import './index.css';

// Lazy load the full app
const App = React.lazy(() => import('./App').then(module => ({ default: module.default })));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">جاري التحميل...</h2>
      <p className="text-gray-600 dark:text-gray-400">نظام إدارة المشاريع NOUFAL</p>
    </div>
  </div>
);

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  
  // Try to load the full app, fallback to simple app if it fails
  root.render(
    <React.StrictMode>
      <Suspense fallback={<LoadingFallback />}>
        <App />
      </Suspense>
    </React.StrictMode>
  );
  
  // If app fails to load within 10 seconds, show simple app
  setTimeout(() => {
    const appContent = document.getElementById('root');
    if (appContent && appContent.innerHTML.includes('جاري التحميل')) {
      console.warn('Full app failed to load, switching to simple app');
      root.render(
        <React.StrictMode>
          <SimpleApp />
        </React.StrictMode>
      );
    }
  }, 10000);
}
