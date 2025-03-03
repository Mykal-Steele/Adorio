/* vite.config.js */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

export default defineConfig({
  base: "/",
  plugins: [react()],
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
