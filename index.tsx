import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Use SimpleApp directly - NO LAZY LOADING
import { SimpleApp } from './SimpleApp';

console.log('🚀 Starting application...');

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    
    // Render SimpleApp directly without StrictMode or Suspense
    root.render(<SimpleApp />);
    
    console.log('✅ SimpleApp rendered successfully');
  } catch (error) {
    console.error('❌ Failed to render SimpleApp:', error);
    // Ultimate fallback
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: 'Tajawal', sans-serif; direction: rtl;">
        <h2 style="color: #e74c3c; margin-bottom: 20px;">حدث خطأ في تحميل التطبيق</h2>
        <p style="color: #666; margin-bottom: 20px;">يرجى تحديث الصفحة أو مسح الذاكرة المؤقتة للمتصفح.</p>
        <button onclick="location.reload()" style="padding: 10px 30px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">تحديث الصفحة</button>
        <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px; text-align: right;">
          <h3 style="color: #666; margin-bottom: 10px;">الخطأ:</h3>
          <pre style="color: #e74c3c; font-size: 12px; text-align: left;">${error}</pre>
        </div>
      </div>
    `;
  }
} else {
  console.error('❌ Root element not found');
}
