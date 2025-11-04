// CRITICAL FIX: Performance polyfill MUST be first
// This fixes React Scheduler error in production
if (typeof window !== 'undefined') {
  // Ensure performance object exists
  if (!window.performance || typeof window.performance.now !== 'function') {
    const startTime = Date.now();
    window.performance = window.performance || ({} as Performance);
    window.performance.now = function() {
      return Date.now() - startTime;
    };
  }
}

import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { SimpleApp } from './SimpleApp';
import './index.css';

// Lazy load the full app
const App = React.lazy(() => 
  import('./App')
    .then(module => {
      console.log('✅ التطبيق الكامل تم تحميله بنجاح');
      return { default: module.default };
    })
    .catch(error => {
      console.error('⚠️ فشل تحميل التطبيق الكامل، استخدام SimpleApp:', error);
      return { default: SimpleApp };
    })
);

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">جاري التحميل...</h2>
      <p className="text-gray-600 dark:text-gray-400">نظام إدارة المشاريع NOUFAL</p>
      <p className="text-xs text-gray-400 mt-2">يرجى الانتظار...</p>
    </div>
  </div>
);

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('❌ خطأ في التطبيق:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      console.warn('⚠️ Error Boundary activated, using SimpleApp fallback');
      return <SimpleApp />;
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    
    // Render with error boundary and suspense
    root.render(
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <App />
        </Suspense>
      </ErrorBoundary>
    );
    
    console.log('🚀 التطبيق بدأ التشغيل...');
    
    // Fallback timeout: if still loading after 10 seconds, switch to SimpleApp
    setTimeout(() => {
      const appContent = document.getElementById('root');
      if (appContent && appContent.innerHTML.includes('جاري التحميل')) {
        console.warn('⏱️ انتهى وقت التحميل، التبديل إلى SimpleApp');
        root.render(
          <ErrorBoundary>
            <SimpleApp />
          </ErrorBoundary>
        );
      }
    }, 10000);
  } catch (error) {
    console.error('❌ فشل تهيئة التطبيق:', error);
    // Ultimate fallback
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: 'Tajawal', sans-serif; direction: rtl;">
        <h2 style="color: #e74c3c; margin-bottom: 20px;">حدث خطأ في تحميل التطبيق</h2>
        <p style="color: #666; margin-bottom: 20px;">يرجى تحديث الصفحة</p>
        <button onclick="location.reload()" style="padding: 12px 30px; background: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;">
          تحديث الصفحة
        </button>
      </div>
    `;
  }
} else {
  console.error('❌ لم يتم العثور على عنصر root');
}
