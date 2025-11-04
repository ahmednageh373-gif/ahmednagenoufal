import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { SimpleApp } from './SimpleApp';
import './index.css';

// Fix for React Scheduler error
if (typeof window !== 'undefined' && !window.performance) {
  window.performance = {
    now: () => Date.now(),
  } as any;
}

// Lazy load the full app with error boundary
const App = React.lazy(() => 
  import('./App')
    .then(module => ({ default: module.default }))
    .catch(error => {
      console.error('Failed to load App:', error);
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
    
    // Timeout fallback
    setTimeout(() => {
      const appContent = document.getElementById('root');
      if (appContent && appContent.innerHTML.includes('جاري التحميل')) {
        console.warn('App loading timeout, switching to SimpleApp');
        root.render(
          <React.StrictMode>
            <SimpleApp />
          </React.StrictMode>
        );
      }
    }, 15000);
  } catch (error) {
    console.error('Failed to initialize app:', error);
    // Fallback to direct render
    rootElement.innerHTML = '<div style="padding: 40px; text-align: center; font-family: Tajawal, sans-serif;"><h2 style="color: #e74c3c; margin-bottom: 20px;">حدث خطأ في تحميل التطبيق</h2><p style="color: #666;">يرجى تحديث الصفحة أو مسح الذاكرة المؤقتة للمتصفح.</p><button onclick="location.reload()" style="margin-top: 20px; padding: 10px 30px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">تحديث الصفحة</button></div>';
  }
}
