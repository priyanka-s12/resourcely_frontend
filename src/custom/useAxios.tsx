import axios, { AxiosError } from 'axios';
import { useState } from 'react';

interface UseAxiosResult<T> {
  data: T;
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
}

function useAxios<T = any>(url: string): UseAxiosResult<T> {
  const [data, setData] = useState<T>([] as unknown as T); // cast empty array to T
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const token = JSON.parse(localStorage.getItem('userToken') || 'null');
    const headers = {
      headers: {
        Authorization: token,
      },
    };

    try {
      const response = await axios.get<T>(url, headers);
      setData(response.data);
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(
        (axiosError.response?.data as any)?.message || axiosError.message
      );
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchData };
}

export default useAxios;
