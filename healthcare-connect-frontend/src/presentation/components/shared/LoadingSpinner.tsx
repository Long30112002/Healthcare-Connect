interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    fullScreen?: boolean;
    text?: string;
    variant?: 'dots' | 'circle';
}

const LoadingSpinner = ({
    size = 'md',
    fullScreen = false,
    text,
    variant = 'circle'
}: LoadingSpinnerProps) => {

    const sizes = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-4',
        lg: 'h-12 w-12 border-4'
    };

    const dots = (
        <div className="flex flex-col items-center justify-center animate-fade-in">
            {text && <h1 className="text-2xl md:text-4xl font-bold text-primary mb-3">{text}</h1>}
            <div className="flex justify-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"></div>
            </div>
        </div>
    );

    const circle = (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className={`${sizes[size]} animate-spin rounded-full border-blue-500 border-t-transparent`} />
            {text && <p className="text-gray-500 dark:text-gray-400 font-medium">{text}</p>}
        </div>
    );

    const content = variant === 'dots' ? dots : circle;

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-[9999]">
                {content}
            </div>
        );
    }

    return content;
};

export default LoadingSpinner;