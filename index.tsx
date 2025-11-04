// CRITICAL: This must be the very first code that runs
// Fix for React Scheduler error BEFORE any imports
if (typeof window !== 'undefined') {
  if (!window.performance) {
    window.performance = {} as any;
  }
  if (!window.performance.now) {
    const startTime = Date.now();
    window.performance.now = () => Date.now() - startTime;
  }
}

import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Import SimpleApp directly (no lazy loading to avoid issues)
import { SimpleApp } from './SimpleApp';

// Try to lazy load the full app, but use SimpleApp as default if it fails
const App = React.lazy(() => 
  import('./App')
    .then(module => {
      console.log('✅ Full App loaded successfully');
      return { default: module.default };
    })
    .catch(error => {
      console.error('❌ Failed to load full App, using SimpleApp:', error);
      return { default: SimpleApp };
    })
);

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">جاري التحميل...</h2>
      <p className="text-gray-600 dark:text-gray-400">نظام إدارة المشاريع NOUFAL</p>
    </div>
  </div>
);

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <SimpleApp />;
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <App />
          </Suspense>
        </ErrorBoundary>
      </React.StrictMode>
    );
    
    // Aggressive timeout fallback - switch to SimpleApp if still loading after 5 seconds
    setTimeout(() => {
      const appContent = document.getElementById('root');
      if (appContent && appContent.innerHTML.includes('جاري التحميل')) {
        console.warn('⚠️ App loading timeout after 5s, switching to SimpleApp');
        root.render(
          <React.StrictMode>
            <SimpleApp />
          </React.StrictMode>
        );
      }
    }, 5000);
  } catch (error) {
    console.error('Failed to initialize app:', error);
    // Fallback to direct render
    rootElement.innerHTML = '<div style="padding: 40px; text-align: center; font-family: Tajawal, sans-serif;"><h2 style="color: #e74c3c; margin-bottom: 20px;">حدث خطأ في تحميل التطبيق</h2><p style="color: #666;">يرجى تحديث الصفحة أو مسح الذاكرة المؤقتة للمتصفح.</p><button onclick="location.reload()" style="margin-top: 20px; padding: 10px 30px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">تحديث الصفحة</button></div>';
  }
}
