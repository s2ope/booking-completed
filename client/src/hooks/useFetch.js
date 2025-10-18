import { useState, useEffect } from "react";
import axios from "axios";

/**
 * useFetch hook
 * @param {string} url - endpoint path (starts with /api/...)
 * Example: useFetch("/api/hotels/countByCity?cities=berlin,madrid,london")
 */
const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const baseURL = process.env.REACT_APP_API_URL;
        if (!baseURL) {
          throw new Error(
            "REACT_APP_API_URL is undefined. Check your .env or Vercel env variables."
          );
        }

        const res = await axios.get(`${baseURL}${url}`);
        setData(res.data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(true);
      }
      setLoading(false);
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};

export default useFetch;
