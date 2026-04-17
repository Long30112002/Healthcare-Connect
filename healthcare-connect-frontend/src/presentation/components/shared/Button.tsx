interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
    fullWidth?: boolean;
    loading?: boolean;
    disabled?: boolean;
    className?: string;
    title?: string;
}

const Button = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    size = 'md',
    rounded = 'md',
    fullWidth = false,
    loading = false,
    disabled = false,
    className = '',
    title,
}: ButtonProps) => {
    const variants = {
        primary: 'bg-primary hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700',
        secondary: 'bg-gray-500 hover:bg-gray-600 text-white dark:bg-gray-600 dark:hover:bg-gray-700',
        danger: 'bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700',
        outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white dark:hover:border-blue-600'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
    };

    const roundedStyles = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full'
    };

    const isLoading = loading;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            title={title}  
            className={`${sizes[size]} ${variants[variant]} ${roundedStyles[rounded]} 
                font-medium transition-all duration-200 ${fullWidth ? 'w-full' : ''}
                ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900
                ${className}`}
        >
            {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {children}
                </div>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;