/* vite.config.js */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

export default defineConfig({
  base: "/",
  plugins: [
    react(),
    {
      name: "security-headers",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          res.setHeader("X-Content-Type-Options", "nosniff");
          res.setHeader("X-Frame-Options", "DENY");
          res.setHeader("X-XSS-Protection", "1; mode=block");
          res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
          res.setHeader(
            "Permissions-Policy",
            "camera=(), microphone=(), geolocation=()"
          );
          next();
        });
      },
      transformIndexHtml(html) {
        const nonce = Buffer.from(Date.now() + Math.random().toString())
          .toString("base64")
          .substring(0, 16);

        return html
          .replace(
            /<head>/,
            `<head>
            <meta http-equiv="Content-Security-Policy" content="
              default-src 'self'; 
              script-src 'self' 'nonce-${nonce}'; 
              style-src 'self' 'unsafe-inline'; 
              img-src 'self' data: blob: https:; 
              connect-src 'self' https://feelio-github-io.onrender.com;
              form-action 'self';
              base-uri 'self';
              object-src 'none';
            ">
          `
          )
          .replace(/<script/g, `<script nonce="${nonce}"`);
      },
    },
  ],
  build: {
    //  splits the app into optimized chunks
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["framer-motion", "@heroicons/react"],
          emoji: ["emoji-mart", "@emoji-mart/data", "@emoji-mart/react"],
          utils: ["moment", "lodash", "dompurify"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    historyApiFallback: true, // Enable history fallback for client-side routing
  },
  css: {
    postcss: {
      plugins: [require("tailwindcss"), require("autoprefixer")],
    },
  },
  define: {
    "process.env": Object.fromEntries(
      Object.entries(process.env).filter(([key]) => key.startsWith("VITE_"))
    ),
    "process.env.CLOUDINARY_NAME": JSON.stringify(process.env.CLOUDINARY_NAME),
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/Components"),
    },
  },
});
