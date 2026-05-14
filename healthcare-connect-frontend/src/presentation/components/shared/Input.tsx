import React, { useState } from 'react';

interface InputProps {
    label?: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;  // 👈 THÊM
    onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void; // 👈 THÊM
    error?: string;
    required?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    rightElement?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
    fullWidth?: boolean;
    className?: string;
    min?: number;    
    max?: number;    
    step?: number | string;   
}

const Input = ({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    onKeyDown,    // 👈 THÊM
    onKeyPress,   // 👈 THÊM
    error,
    required = false,
    disabled = false,
    icon,
    rightElement,
    size = 'md',
    rounded = 'md',
    fullWidth = true,
    className = '',
    min,           
    max,           
    step,          
}: InputProps) => {
    const [isFocused, setIsFocused] = useState(false);

    const sizes = {
        sm: 'py-1.5 text-sm',
        md: 'py-2.5 text-base',
        lg: 'py-3.5 text-lg'
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

    const rightElementSizes = {
        sm: 'pr-8',
        md: 'pr-10',
        lg: 'pr-12'
    };

    return (
        <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
            {label && (
                <label className={`block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors ${disabled ? 'opacity-60' : ''}`}>
                    {label} {required && <span className="text-red-500 dark:text-red-400">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <div className={`transition-colors duration-200 ${
                            disabled ? 'opacity-50' :
                            isFocused 
                                ? 'text-primary dark:text-blue-400' 
                                : error 
                                    ? 'text-red-500 dark:text-red-400' 
                                    : 'text-gray-400 dark:text-gray-500'
                        }`}>
                            {icon}
                        </div>
                    </div>
                )}
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onKeyDown={onKeyDown}    // 👈 THÊM
                    onKeyPress={onKeyPress}  // 👈 THÊM
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    required={required}
                    disabled={disabled}
                    min={min}     
                    max={max}     
                    step={step}   
                    className={`
                        ${sizes[size]} 
                        ${roundedStyles[rounded]} 
                        ${icon ? iconSizes[size] : 'px-4'} 
                        ${rightElement ? rightElementSizes[size] : 'pr-4'}
                        w-full 
                        border-2 
                        transition-all 
                        duration-200 
                        outline-none
                        ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-700' : ''}
                        ${error && !disabled
                            ? 'border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/20' 
                            : isFocused && !disabled
                                ? 'border-primary dark:border-blue-400'
                                : 'border-gray-200 dark:border-gray-700'
                        }
                        ${!error && !isFocused && !disabled && 'hover:border-gray-300 dark:hover:border-gray-600'}
                        bg-white dark:bg-gray-800/90
                        text-gray-900 dark:text-gray-100
                        placeholder:text-gray-400 dark:placeholder:text-gray-500
                        focus:ring-2 
                        focus:ring-primary/20 
                        dark:focus:ring-blue-400/20
                        shadow-sm
                    `}
                />
                {rightElement && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {rightElement}
                    </div>
                )}
            </div>
            {error && !disabled && (
                <p className="mt-1.5 text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;