// ULTRA CRITICAL FIX: This MUST run before ANYTHING else
// Create a complete Performance API polyfill
(function() {
  if (typeof window === 'undefined') return;
  
  // Force create performance object
  const startTime = Date.now();
  
  // Create complete performance object
  if (!window.performance) {
    window.performance = {} as any;
  }
  
  // Add all required methods
  if (!window.performance.now) {
    window.performance.now = function() { return Date.now() - startTime; };
  }
  if (!window.performance.mark) {
    window.performance.mark = function() {};
  }
  if (!window.performance.measure) {
    window.performance.measure = function() {};
  }
  if (!window.performance.clearMarks) {
    window.performance.clearMarks = function() {};
  }
  if (!window.performance.clearMeasures) {
    window.performance.clearMeasures = function() {};
  }
  if (!window.performance.getEntriesByType) {
    window.performance.getEntriesByType = function() { return []; };
  }
  if (!window.performance.getEntriesByName) {
    window.performance.getEntriesByName = function() { return []; };
  }
  
  console.log('✅ Performance API polyfill initialized');
})();

import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

console.log('🚀 بدء تحميل React...');

// Import App directly
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';

console.log('✅ App module imported');

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
    console.error('🔴 ErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('❌ خطأ في التطبيق:', error, errorInfo);
    console.error('Stack:', error.stack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: '40px', textAlign: 'center', fontFamily: 'Tajawal, sans-serif', direction: 'rtl'}}>
          <h2 style={{color: '#e74c3c', marginBottom: '20px'}}>⚠️ خطأ في التطبيق</h2>
          <p style={{color: '#666', marginBottom: '20px'}}>حدث خطأ أثناء تحميل التطبيق</p>
          <button onClick={() => window.location.reload()} style={{padding: '12px 30px', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold'}}>
            تحديث الصفحة
          </button>
          <pre style={{textAlign: 'left', background: '#f5f5f5', padding: '15px', marginTop: '20px', overflow: 'auto', direction: 'ltr'}}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    console.log('🎨 بدء رندر التطبيق...');
    
    const root = ReactDOM.createRoot(rootElement);
    
    // Render the full app
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
    
    console.log('✅ تم رندر التطبيق بنجاح');
    
  } catch (error) {
    console.error('❌ خطأ حرج في رندر التطبيق:', error);
    console.error('Stack:', (error as Error).stack);
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: 'Tajawal', sans-serif; direction: rtl;">
        <h2 style="color: #e74c3c; margin-bottom: 20px;">⚠️ خطأ حرج</h2>
        <p style="color: #666; margin-bottom: 20px;">فشل تحميل التطبيق. يرجى:</p>
        <ol style="text-align: right; color: #666; margin: 20px auto; max-width: 400px;">
          <li>مسح الذاكرة المؤقتة (Cache)</li>
          <li>تحديث الصفحة</li>
          <li>استخدام متصفح آخر</li>
        </ol>
        <button onclick="location.reload()" style="padding: 12px 30px; background: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;">
          تحديث الصفحة
        </button>
        <pre style="text-align: left; background: #f5f5f5; padding: 15px; margin-top: 20px; overflow: auto; direction: ltr; max-height: 400px;">
${String(error)}

Stack Trace:
${error instanceof Error ? error.stack : 'No stack trace available'}
        </pre>
      </div>
    `;
  }
} else {
  console.error('❌ لم يتم العثور على عنصر root');
}
