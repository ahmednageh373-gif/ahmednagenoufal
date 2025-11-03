import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
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
        chunkSizeWarningLimit: 2000, // رفع الحد إلى 2000 KB (2MB) لتجنب التحذيرات
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              // تقسيم React و React DOM في chunk منفصل
              if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
                return 'react-vendor';
              }
              
              // تقسيم Recharts (كبير جداً - 1MB+)
              if (id.includes('node_modules/recharts')) {
                return 'charts-lib';
              }
              
              // تقسيم Lucide Icons (متوسط)
              if (id.includes('node_modules/lucide-react')) {
                return 'icons-lib';
              }
              
              // تقسيم المكتبات الصغيرة
              if (id.includes('node_modules/uuid') || 
                  id.includes('node_modules/zustand') || 
                  id.includes('node_modules/marked')) {
                return 'utils-lib';
              }
              
              // تقسيم @tensorflow (إذا موجود - كبير جداً)
              if (id.includes('node_modules/@tensorflow')) {
                return 'tf-lib';
              }
              
              // تقسيم @google/genai
              if (id.includes('node_modules/@google/genai')) {
                return 'genai-lib';
              }
              
              // باقي node_modules - تقسيم حسب الحجم
              if (id.includes('node_modules')) {
                // الملفات الكبيرة في vendor-large
                const largeLibs = ['pdf', 'xlsx', 'chart', 'sortable'];
                if (largeLibs.some(lib => id.toLowerCase().includes(lib))) {
                  return 'vendor-large';
                }
                // الباقي في vendor
                return 'vendor';
              }
            },
            // تحسين أسماء الملفات
            entryFileNames: 'assets/[name]-[hash].js',
            chunkFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]'
          }
        },
        // تحسين الأداء - استخدام esbuild (أسرع من terser)
        minify: 'esbuild',
        target: 'es2015',
        // تقليل حجم CSS
        cssCodeSplit: true,
        // تمكين Source maps للتطوير فقط
        sourcemap: mode === 'development',
      },
      // تحسين الأداء
      optimizeDeps: {
        include: ['react', 'react-dom', 'lucide-react', 'recharts', 'uuid', 'zustand', 'marked'],
        exclude: [],
      },
    };
});
