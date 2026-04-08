import React from 'react';

interface EmptyStateProps {
    title?: string;
    message?: string;
    icon?: React.ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
}

const EmptyState = ({
    title = 'Không có dữ liệu',
    message = 'Chưa có dữ liệu nào để hiển thị',
    icon,
    action
}: EmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            {icon ? (
                <div className="text-5xl mb-4 opacity-50">{icon}</div>
            ) : (
                <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )}
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
                {message}
            </p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="mt-4 px-4 py-2 text-sm text-primary hover:text-blue-700 font-medium"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};

export default EmptyState;