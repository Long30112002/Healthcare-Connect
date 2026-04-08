import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../../infrastructure/api/axiosClient';

interface UseFetchOptions<T> {
    immediate?: boolean;
    initialData?: T | null;
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
}

interface UseFetchReturn<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    execute: (...args: any[]) => Promise<void>;
    reset: () => void;
}

function useFetch<T = any>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    options?: UseFetchOptions<T>
): UseFetchReturn<T> {
    const [data, setData] = useState<T | null>(options?.initialData ?? null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const reset = useCallback(() => {
        setData(options?.initialData ?? null);
        setError(null);
    }, [options?.initialData]);

    const execute = useCallback(async (...args: any[]) => {
        setLoading(true);
        setError(null);

        try {
            let response;
            const requestData = args[0];
            const config = args[1];

            switch (method) {
                case 'GET':
                    response = await axiosClient.get(url, config);
                    break;
                case 'POST':
                    response = await axiosClient.post(url, requestData, config);
                    break;
                case 'PUT':
                    response = await axiosClient.put(url, requestData, config);
                    break;
                case 'PATCH':
                    response = await axiosClient.patch(url, requestData, config);
                    break;
                case 'DELETE':
                    response = await axiosClient.delete(url, config);
                    break;
                default:
                    throw new Error(`Unsupported method: ${method}`);
            }

            // Backend trả về ApiResponse, data nằm trong response.data.data
            const responseData = response.data?.data ?? response.data;
            setData(responseData);
            options?.onSuccess?.(responseData);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra';
            setError(errorMessage);
            options?.onError?.(err);
        } finally {
            setLoading(false);
        }
    }, [url, method, options]);

    // Tự động gọi nếu immediate = true
    useEffect(() => {
        if (options?.immediate !== false) {
            execute();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Chỉ chạy 1 lần khi mount, không cần theo dõi execute

    return { data, loading, error, execute, reset };
}

export default useFetch;