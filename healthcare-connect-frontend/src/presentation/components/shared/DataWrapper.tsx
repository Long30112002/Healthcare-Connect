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
    emptyDescription?: string;      // ← thêm
    emptyActionText?: string;       // ← thêm
    onEmptyAction?: () => void;     // ← thêm
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
    emptyDescription,
    emptyActionText,
    onEmptyAction,
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

    if (error) {
        return (
            <div className="py-4">
                <ErrorMessage message={error} onRetry={onRetry} />
            </div>
        );
    }

    if (!data || (Array.isArray(data) && data.length === 0)) {
        return (
            <EmptyState
                icon={showEmptyIcon ? '📋' : undefined}
                title={emptyMessage}
                description={emptyDescription}      // ← sửa: dùng description
                actionText={emptyActionText}        // ← thêm
                onAction={onEmptyAction}            // ← thêm
            />
        );
    }

    return <>{children(data)}</>;
}

export default DataWrapper;