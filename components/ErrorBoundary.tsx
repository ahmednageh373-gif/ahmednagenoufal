/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, FileText } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: any[]; // Keys that trigger a reset when changed
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🔴 ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Log to external error tracking service (e.g., Sentry, LogRocket)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error boundary when resetKeys change
    if (this.props.resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys![index]
      );
      
      if (hasResetKeyChanged && this.state.hasError) {
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
        });
      }
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = () => {
    const { error, errorInfo } = this.state;
    const errorReport = {
      error: error?.toString(),
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };
    
    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2));
    
    alert('تم نسخ تقرير الخطأ إلى الحافظة');
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6">
              <div className="flex items-center gap-4 text-white">
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    عذراً، حدث خطأ غير متوقع
                  </h1>
                  <p className="text-red-100 mt-1">
                    نحن نعمل على حل المشكلة
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Error Message */}
              {this.state.error && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-red-900 dark:text-red-300 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    رسالة الخطأ:
                  </h3>
                  <p className="text-red-800 dark:text-red-200 font-mono text-sm">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-6">
                  <summary className="font-semibold text-gray-900 dark:text-gray-300 cursor-pointer mb-2">
                    تفاصيل تقنية (Development Mode)
                  </summary>
                  <pre className="text-xs text-gray-800 dark:text-gray-200 overflow-auto max-h-64 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 flex-wrap mb-6">
                <button
                  onClick={this.handleReset}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <RefreshCw className="w-5 h-5" />
                  إعادة المحاولة
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors shadow-md"
                >
                  <Home className="w-5 h-5" />
                  العودة للرئيسية
                </button>
                
                <button
                  onClick={this.handleReportError}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors shadow-md"
                >
                  <FileText className="w-5 h-5" />
                  نسخ التقرير
                </button>
              </div>

              {/* Help Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  خطوات مقترحة لحل المشكلة:
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">1.</span>
                    <span>انقر على "إعادة المحاولة" أعلاه</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">2.</span>
                    <span>حدّث الصفحة (اضغط F5 أو Ctrl+R)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">3.</span>
                    <span>امسح ذاكرة التخزين المؤقت للمتصفح</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">4.</span>
                    <span>إذا استمرت المشكلة، انقر على "نسخ التقرير" وأرسله للدعم الفني</span>
                  </li>
                </ul>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  إذا كنت بحاجة لمساعدة إضافية، تواصل مع الدعم الفني
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-Order Component (HOC) for easy wrapping
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Hook-based error boundary (for function components)
 * Note: This uses a class component internally since hooks can't catch errors yet
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  if (error) {
    throw error;
  }

  return setError;
}
