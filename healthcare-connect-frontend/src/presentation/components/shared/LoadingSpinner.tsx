interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    fullScreen?: boolean;
    text?: string;
}

const LoadingSpinner = ({ size = 'md', fullScreen = false, text }: LoadingSpinnerProps) => {
    const sizes = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-3',
        lg: 'h-12 w-12 border-4'
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className={`${sizes[size]} animate-spin rounded-full border-primary border-t-transparent`} />
            {text && <p className="text-gray-500 dark:text-gray-400">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;