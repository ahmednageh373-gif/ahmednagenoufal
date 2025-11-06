import React from 'react';
import ReactDOM from 'react-dom/client';

const MinimalApp = () => {
  return (
    <div style={{padding: '40px', fontFamily: 'Arial', textAlign: 'center'}}>
      <h1>✅ التطبيق يعمل!</h1>
      <p>إذا رأيت هذه الرسالة، فالتطبيق يعمل بنجاح</p>
    </div>
  );
};

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(<MinimalApp />);
}
