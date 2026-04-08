import React from 'react';

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
    className = ''
}: ButtonProps) => {
    const variants = {
        primary: 'bg-primary hover:bg-blue-700 text-white',
        secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
        danger: 'bg-red-500 hover:bg-red-600 text-white',
        outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
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

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${sizes[size]} ${variants[variant]} ${roundedStyles[rounded]} 
                font-medium transition duration-200 ${fullWidth ? 'w-full' : ''}
                ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                ${className}`}
        >
            {loading ? (
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