interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
    size?: 'sm' | 'md' | 'lg';
}

const ErrorMessage = ({ message, onRetry, size = 'md' }: ErrorMessageProps) => {
    const paddings = {
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6'
    };

    return (
        <div className={`${paddings[size]} bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700 dark:text-red-400">{message}</p>
                </div>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                    >
                        Thử lại
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorMessage;