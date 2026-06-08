import axios from "axios";

const PRODUCTION_API_URL = "https://mern-backend-j4gu.onrender.com";

const normalizeApiBase = (url) => {
  if (!url) return "/api";
  const trimmed = url.replace(/\/$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const baseURL = import.meta.env.DEV
  ? "/api"
  : normalizeApiBase(import.meta.env.VITE_API_URL || PRODUCTION_API_URL);

export const api = axios.create({
  baseURL,
  withCredentials: true, // only if using cookies
  timeout: 45000,
});
