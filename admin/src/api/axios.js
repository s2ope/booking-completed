import axios from "axios";

const missingProductionApiURL =
  !import.meta.env.DEV && !import.meta.env.VITE_API_URL;

const getBaseURL = () => {
  if (import.meta.env.DEV) return "/api";

  const apiURL = import.meta.env.VITE_API_URL || "";
  if (!apiURL) return "";

  return apiURL.endsWith("/api") ? apiURL : `${apiURL.replace(/\/$/, "")}/api`;
};

export const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (missingProductionApiURL) {
    throw new Error(
      "Admin API URL is not configured. Set VITE_API_URL to your Render API URL in Vercel and redeploy."
    );
  }

  return config;
});
