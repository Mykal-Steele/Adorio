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

        // First replace the backend URL script with one that has the nonce
        html = html.replace(
          /<script>\s*\/\/\s*hardcoding the backend url here so i can change it without rebuilding\s*window\.VITE_BACKEND_URL\s*=\s*"[^"]+"\s*;\s*<\/script>/,
          `<script nonce="${nonce}">
            // hardcoding the backend url here so i can change it without rebuilding
            window.VITE_BACKEND_URL = "https://feelio-github-io.onrender.com";
          </script>`
        );

        // csp stuff took me like 3 days to figure out - stackoverflow is my best friend
        const isDev = process.env.NODE_ENV === 'development';
        const scriptSrc = isDev
          ? `'self' 'nonce-${nonce}' 'unsafe-eval'`
          : `'self' 'nonce-${nonce}'`;

        return html
          .replace(
            /<head>/,
            `<head>
            <meta http-equiv="Content-Security-Policy" content="
              default-src 'self'; 
              script-src ${scriptSrc}; 
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com;
              connect-src 'self' https://feelio-github-io.onrender.com https://feelio-github-io.onrender.com/api/*;
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
      'https://feelio-github-io.onrender.com'
    ),
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/Components'),
    },
  },
});
