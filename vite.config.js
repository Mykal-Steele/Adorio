/* vite.config.js */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export default defineConfig({
  base: '/',
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
      babel: {
        plugins: [],
      },
    }),
    {
      name: 'security-headers',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          res.setHeader('X-Content-Type-Options', 'nosniff');
          res.setHeader('X-Frame-Options', 'DENY');
          res.setHeader('X-XSS-Protection', '1; mode=block');
          res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
          res.setHeader(
            'Permissions-Policy',
            'camera=(), microphone=(), geolocation=()'
          );

          // look at me being all security conscious lol
          // meanwhile my actual password was in a .env.example file i accidentally pushed to github
          // (don't worry i changed it... eventually)

          next();
        });
      },
      transformIndexHtml(html) {
        const nonce = Buffer.from(Date.now() + Math.random().toString())
          .toString('base64')
          .substring(0, 16);

        // Get the backend URL based on environment
        const isDev = process.env.NODE_ENV === 'development';
        const backendUrl = isDev
          ? 'http://localhost:3000'
          : 'https://adorio.space';

        // First replace the backend URL script with one that has the nonce
        html = html.replace(
          /<script>\s*\/\/\s*hardcoding the backend url here so i can change it without rebuilding\s*window\.VITE_BACKEND_URL\s*=\s*"[^"]+"\s*;\s*<\/script>/,
          `<script nonce="${nonce}">
            // hardcoding the backend url here so i can change it without rebuilding
            window.VITE_BACKEND_URL = "${backendUrl}";
          </script>`
        );

        // csp stuff took me like 3 days to figure out - stackoverflow is my best friend
        // Note: 'unsafe-eval' is needed for the coding platform to execute user code safely
        const scriptSrc = `'self' 'nonce-${nonce}' 'unsafe-eval' https://static.cloudflareinsights.com https://challenges.cloudflare.com`;
        const connectSrc = isDev
          ? `'self' http://localhost:3000 http://localhost:3000/api/* http://localhost:3000/api/users/login https://cdnjs.cloudflare.com`
          : `'self' https://adorio.space/* https://www.adorio.space/* https://cdnjs.cloudflare.com https://cloudflareinsights.com https://*.cloudflare.com`;

        return html
          .replace(
            /<head>/,
            `<head>
            <meta http-equiv="Content-Security-Policy" content="
              default-src 'self'; 
              script-src ${scriptSrc}; 
              style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
              img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com;
              connect-src ${connectSrc};
              frame-src 'self' https: http:;
              worker-src 'self' blob:;
              form-action 'self';
              base-uri 'self';
              object-src 'none';
            ">
          `
          )
          .replace(/<script(?!\s+nonce=)/g, `<script nonce="${nonce}"`);
      },
    },
  ],
  build: {
    //  splits the app into optimized chunks
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', '@heroicons/react'],
          emoji: ['emoji-mart', '@emoji-mart/data', '@emoji-mart/react'],
          utils: ['moment', 'lodash', 'dompurify'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    historyApiFallback: true, // enable history fallback for client-side routing
  },
  css: {
    postcss: {
      plugins: [require('tailwindcss'), require('autoprefixer')],
    },
  },
  define: {
    'process.env': Object.fromEntries(
      Object.entries(process.env).filter(([key]) => key.startsWith('VITE_'))
    ),
    'process.env.CLOUDINARY_NAME': JSON.stringify(process.env.CLOUDINARY_NAME),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'import.meta.env.VITE_BACKEND_URL': JSON.stringify(
      process.env.VITE_BACKEND_URL
    ),
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/Components'),
    },
  },
});
