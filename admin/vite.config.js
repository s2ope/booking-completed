import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      open: true,
      port: 3000,
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:8800",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
