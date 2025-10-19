import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    port: 3000,
    proxy: {
      "/api": {
        target: process.env.REACT_APP_API_URL || "http://localhost:8800", // fallback to local backend if env not set
        changeOrigin: true,
        secure: false, // set true if backend uses HTTPS
      },
    },
  },
});
