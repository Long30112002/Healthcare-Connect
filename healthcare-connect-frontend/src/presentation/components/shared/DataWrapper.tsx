import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import EmptyState from './EmptyState';

interface DataWrapperProps<T> {
    loading: boolean;
    error: string | null;
    data: T | null;
    children: (data: T) => React.ReactNode;
    onRetry?: () => void;
    emptyMessage?: string;
    loadingSize?: 'sm' | 'md' | 'lg';
    showEmptyIcon?: boolean;
}

function DataWrapper<T>({
    loading,
    error,
    data,
    children,
    onRetry,
    emptyMessage = 'Không có dữ liệu',
    loadingSize = 'md',
    showEmptyIcon = true
}: DataWrapperProps<T>) {
    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <LoadingSpinner size={loadingSize} />
            </div>
        );
    }

    // Có lỗi
    if (error) {
        return (
            <div className="py-4">
                <ErrorMessage message={error} onRetry={onRetry} />
            </div>
        );
    }

    // Không có dữ liệu
    if (!data || (Array.isArray(data) && data.length === 0)) {
        return (
            <EmptyState
                title="Trống"
                message={emptyMessage}
                icon={showEmptyIcon ? '📋' : undefined}
                action={onRetry ? { label: 'Tải lại', onClick: onRetry } : undefined}
            />
        );
    }

    return <>{children(data)}</>;
}

export default DataWrapper;