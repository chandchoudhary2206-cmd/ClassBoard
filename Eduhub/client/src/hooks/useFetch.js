import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

function useFetch(url, params = {}, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { enabled = true } = options;

  const fetchData = useCallback(async () => {
    if (!url) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(url, { params });
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(params)]);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [fetchData, enabled]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

export default useFetch;
