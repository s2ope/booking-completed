import axios from "axios";

const getBaseURL = () => {
  if (import.meta.env.DEV) return "/api";

  const apiURL = import.meta.env.VITE_API_URL || "";
  if (!apiURL) return "/api";

  return apiURL.endsWith("/api") ? apiURL : `${apiURL.replace(/\/$/, "")}/api`;
};

export const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});
