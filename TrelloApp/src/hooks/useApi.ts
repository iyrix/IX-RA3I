import { useState, useEffect } from 'react';

interface Options {
  [key: string]: any;
}

interface ApiResult<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

const useApi = <T>(url: string, method = 'GET', options: Options = {}): ApiResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url, { method, ...options });
        const result = await response.json();
        setData(result);
      } catch (error: any) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url, method, options]);

  return { data, error, isLoading };
};

export default useApi;
