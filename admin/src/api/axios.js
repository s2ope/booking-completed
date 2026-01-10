import axios from "axios";

// Dynamically set baseURL
const baseURL = import.meta.env.DEV
  ? "/api" // use Vite proxy in dev
  : import.meta.env.VITE_API_URL; // full Render URL in production

export const api = axios.create({
  baseURL,
  withCredentials: true, // only if using cookies
});
