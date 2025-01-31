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
        target: "http://localhost:8800", // Your backend URL
        changeOrigin: true,
        secure: false, // Set to true if using HTTPS in your backend
      },
    },
  },
});
