import React from 'react';

interface InputProps {
    label?: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    required?: boolean;
    icon?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';  
    fullWidth?: boolean;
}

const Input = ({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    error,
    required = false,
    icon,
    size = 'md',
    rounded = 'md', 
    fullWidth = true
}: InputProps) => {
    const sizes = {
        sm: 'py-1.5 text-sm',
        md: 'py-2 text-base',
        lg: 'py-3 text-lg'
    };

    const roundedStyles = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full'
    };

    const iconSizes = {
        sm: 'pl-8',
        md: 'pl-10',
        lg: 'pl-12'
    };

    return (
        <div className={`${fullWidth ? 'w-full' : ''}`}>
            {label && (
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className={`${sizes[size]} ${roundedStyles[rounded]} 
                        ${icon ? iconSizes[size] : 'px-3'} 
                        w-full border-2 ${error ? 'border-red-500' : 'border-gray-200'} 
                        focus:ring-2 focus:ring-primary focus:border-transparent 
                        transition duration-200 outline-none`}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};

export default Input;