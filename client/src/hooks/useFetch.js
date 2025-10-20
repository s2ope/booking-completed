import { useEffect, useState } from "react";
import axios from "axios";

const useFetch = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Automatically choose backend based on environment
  const baseURL = import.meta.env.DEV
    ? "http://localhost:8800" // local backend during development
    : import.meta.env.VITE_API_URL || ""; // production backend from .env

  // ✅ Ensure there’s exactly one slash between baseURL and url
  const fullURL = `${baseURL.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(fullURL);
        setData(res.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fullURL]);

  // Manual re-fetch option
  const reFetch = async () => {
    setLoading(true);
    try {
      const res = await axios.get(fullURL);
      setData(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, reFetch };
};

export default useFetch;
