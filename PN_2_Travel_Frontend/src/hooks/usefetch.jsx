import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

const useFetch = (endpoint, page = 1, limit = 10) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${endpoint}?page=${page}&limit=${limit}`);
        if (page === 1) {
          setData(res.data.hotels);
        } else {
          setData(prev => [...prev, ...res.data.hotels]);
        }
        setHasMore(res.data.pagination.page < res.data.pagination.pages);
      } catch (err) {
        setError(err);
      }
      setLoading(false);
    };
    fetchData();
  }, [endpoint, page, limit]);



  const reFetch = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${endpoint}?page=1&limit=${limit}`);
      setData(res.data.hotels);
      setHasMore(res.data.pagination.page < res.data.pagination.pages);
    } catch (err) {
      setError(err);
    }
    setLoading(false);
  };

  return { data, loading, error, reFetch, hasMore };
};

export default useFetch;
