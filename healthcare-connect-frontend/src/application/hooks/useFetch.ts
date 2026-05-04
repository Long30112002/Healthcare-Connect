import { useState, useEffect, useCallback, useRef } from 'react';
import axiosClient from '../../infrastructure/api/axiosClient';

interface UseFetchOptions<T> {
    immediate?: boolean;
    initialData?: T | null;
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
    deps?: any[];
}

interface UseFetchReturn<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    execute: (...args: any[]) => Promise<void>;
    reset: () => void;
    refetch: () => void;
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

    const methodRef = useRef(method);
    useEffect(() => {
        methodRef.current = method;
    }, [method]);

    const execute = useCallback(async (customUrl?: string, requestData?: any, config?: any) => {
        const finalUrl = customUrl || url;
        if (!finalUrl) return;

        setLoading(true);
        setError(null);

        try {
            let response;
            const currentMethod = methodRef.current;

            switch (currentMethod) {
                case 'GET':
                    response = await axiosClient.get(finalUrl, config);
                    break;
                case 'POST':
                    response = await axiosClient.post(finalUrl, requestData, config);
                    break;
                case 'PUT':
                    response = await axiosClient.put(finalUrl, requestData, config);
                    break;
                case 'PATCH':
                    response = await axiosClient.patch(finalUrl, requestData, config);
                    break;
                case 'DELETE':
                    response = await axiosClient.delete(finalUrl, config);
                    break;
                default:
                    throw new Error(`Unsupported method: ${currentMethod}`);
            }

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
    }, [url, options]);

    const refetch = useCallback(() => {
        execute();
    }, [execute]);

    useEffect(() => {
        if (options?.immediate !== false && url) {
            execute();
        }
    }, [url, ...(options?.deps || [])]);

    return { data, loading, error, execute, reset, refetch };
}

export default useFetch;