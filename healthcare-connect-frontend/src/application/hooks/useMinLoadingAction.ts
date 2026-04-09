import { useState } from 'react';
import toast from 'react-hot-toast';

interface UseMinLoadingActionOptions {
  minLoadingTime?: number;
  successMessage?: string;
  errorMessage?: string | ((error: any) => string);
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useMinLoadingAction = (options: UseMinLoadingActionOptions = {}) => {
  const {
    minLoadingTime = 1500,
    successMessage,
    errorMessage,
    onSuccess,
    onError,
  } = options;

  const [loading, setLoading] = useState(false);

  const execute = async <T,>(action: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    
    const minLoadPromise = new Promise(resolve => setTimeout(resolve, minLoadingTime));
    
    try {
      const [result] = await Promise.all([action(), minLoadPromise]);
      
      if (successMessage) {
        toast.success(successMessage);
      }
      onSuccess?.(result);
      return result;
    } catch (err: any) {
      let finalErrorMessage: string;
      
      if (typeof errorMessage === 'function') {
        finalErrorMessage = errorMessage(err);
      } else if (errorMessage) {
        finalErrorMessage = errorMessage;
      } else {
        finalErrorMessage = err.response?.data?.message || 'Có lỗi xảy ra';
      }
      
      toast.error(finalErrorMessage);
      onError?.(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading };
};