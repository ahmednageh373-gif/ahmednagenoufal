/**
 * ═══════════════════════════════════════════════════════════════════
 * NOUFAL Engineering Management System
 * Main Entry Point - React Application
 * ═══════════════════════════════════════════════════════════════════
 * 
 * @version 2.1
 * @author NOUFAL Team
 * @date 2025-11-07
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
