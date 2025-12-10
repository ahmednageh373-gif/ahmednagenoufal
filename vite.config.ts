import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5173,
        strictPort: false, // اسمح بالتغيير التلقائي للمنفذ
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
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['icons/*.svg', 'robots.txt'],
          manifest: {
            name: 'AN.AI Ahmed Nageh - Construction Management',
            short_name: 'AN.AI Projects',
            description: 'نظام متكامل لإدارة المشاريع الهندسية والإنشائية',
            theme_color: '#1e40af',
            background_color: '#ffffff',
            display: 'standalone',
            scope: '/',
            start_url: '/',
            orientation: 'any',
            lang: 'ar',
            dir: 'rtl',
            icons: [
              {
                src: '/icons/icon-192x192.svg',
                sizes: '192x192',
                type: 'image/svg+xml',
                purpose: 'any maskable'
              },
              {
                src: '/icons/icon-512x512.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
                purpose: 'any maskable'
              }
            ]
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,gif,webp,woff,woff2,ttf,eot,ico}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              },
              {
                urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'gstatic-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              },
              {
                urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'images-cache',
                  expiration: {
                    maxEntries: 60,
                    maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
                  }
                }
              }
            ]
          },
          devOptions: {
            enabled: true,
            type: 'module'
          }
        })
      ],
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
