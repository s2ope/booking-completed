import { useEffect, useState } from "react";
import axios from "axios";

const useFetch = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Prepend backend URL if environment variable exists
  const baseURL = import.meta.env.VITE_API_URL || "";

  const fullURL = `${baseURL}${url}`; // full URL for axios

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(fullURL);
        setData(res.data);
      } catch (err) {
        setError(err);
      }
      setLoading(false);
    };
    fetchData();
  }, [fullURL]);

  const reFetch = async () => {
    setLoading(true);
    try {
      const res = await axios.get(fullURL);
      setData(res.data);
    } catch (err) {
      setError(err);
    }
    setLoading(false);
  };

  return { data, loading, error, reFetch };
};

export default useFetch;
