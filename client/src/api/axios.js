import axios from "axios";

const normalizeApiBase = (url) => {
  if (!url) return "/api";
  const trimmed = url.replace(/\/$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const baseURL = import.meta.env.DEV
  ? "/api"
  : normalizeApiBase(import.meta.env.VITE_API_URL);

export const api = axios.create({
  baseURL,
  withCredentials: true, // only if using cookies
});
