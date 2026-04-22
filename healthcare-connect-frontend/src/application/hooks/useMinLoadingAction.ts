import { useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

interface UseMinLoadingActionOptions<T> {
    minLoadingTime?: number;
    successMessage?: string;
    errorMessage?: string | ((error: any) => string);
    onSuccess?: (result: T) => void;
    onError?: (error: any) => void;
}


export const useMinLoadingAction = <T = any>(options: UseMinLoadingActionOptions<T> = {}) => {
    const {
        minLoadingTime = 1000,
        successMessage,
        errorMessage,
        onSuccess,
        onError,
    } = options;

    const [loading, setLoading] = useState(false);
    const startTimeRef = useRef<number | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isExecutingRef = useRef(false);

    const execute = useCallback(async (action: () => Promise<T>): Promise<T | null> => {
        if (isExecutingRef.current) {
            return null;
        }

        isExecutingRef.current = true;
        setLoading(true);
        startTimeRef.current = Date.now();

        try {
            const result = await action();

            const elapsed = Date.now() - (startTimeRef.current || Date.now());
            const remaining = Math.max(0, minLoadingTime - elapsed);

            if (remaining > 0) {
                await new Promise(resolve => {
                    timerRef.current = setTimeout(resolve, remaining);
                });
            }

            if (successMessage) {
                toast.success(successMessage);
            }

            onSuccess?.(result);
            return result;
        } catch (error: any) {
            const elapsed = Date.now() - (startTimeRef.current || Date.now());
            const remaining = Math.max(0, minLoadingTime - elapsed);

            if (remaining > 0) {
                await new Promise(resolve => {
                    timerRef.current = setTimeout(resolve, remaining);
                });
            }

            let errorMsg: string;
            if (typeof errorMessage === 'function') {
                errorMsg = errorMessage(error);
            } else if (errorMessage) {
                errorMsg = errorMessage;
            } else {
                errorMsg = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra';
            }

            if (errorMsg) {
                toast.error(errorMsg);
            } else {
                toast.error('Lỗi không xác định');
            }

            onError?.(error);
            return null;
        } finally {
            setLoading(false);
            isExecutingRef.current = false;
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            startTimeRef.current = null;
        }
    }, [minLoadingTime, successMessage, errorMessage, onSuccess, onError]);

    return { execute, loading };
};