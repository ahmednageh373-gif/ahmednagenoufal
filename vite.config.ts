import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3002,
        strictPort: true, // لا تغير المنفذ تلقائياً - استخدم 3002 دائماً
        host: '0.0.0.0',
        allowedHosts: [
          'localhost',
          '127.0.0.1',
          '.sandbox.novita.ai'
        ],
        hmr: {
          clientPort: 443,
          protocol: 'wss'
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        chunkSizeWarningLimit: 5000, // رفع الحد إلى 5000 KB (5MB)
        // Enable minification for production
        minify: mode === 'production' ? 'esbuild' : false,
        target: 'es2020',
        // تقليل حجم CSS
        cssCodeSplit: true,
        // تمكين Source maps للتطوير فقط
        sourcemap: mode === 'development',
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'charts': ['recharts'],
              'three': ['three', '@react-three/fiber', '@react-three/drei'],
              'pdf-tools': ['jspdf', 'jspdf-autotable', 'pdf-lib'],
              'excel': ['xlsx', 'exceljs']
            }
          }
        }
      },
      // تحسين الأداء
      optimizeDeps: {
        include: ['react', 'react-dom', 'lucide-react', 'recharts', 'uuid', 'zustand', 'marked'],
        exclude: [],
      },
    };
});
