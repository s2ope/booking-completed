import axios from "axios";

const PRODUCTION_API_URL = "https://mern-backend-j4gu.onrender.com";

const normalizeApiURL = (url) => {
  const trimmedUrl = url.replace(/\/$/, "");
  return trimmedUrl.endsWith("/api") ? trimmedUrl : `${trimmedUrl}/api`;
};

const getBaseURL = () => {
  if (import.meta.env.DEV) return "/api";

  return normalizeApiURL(import.meta.env.VITE_API_URL || PRODUCTION_API_URL);
};

export const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});
