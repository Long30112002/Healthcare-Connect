export interface FilterOption {
    key: string;
    label: string;
    icon?: string;
}

interface FilterTabsProps {
    options: FilterOption[];
    activeKey: string;
    onSelect: (key: string) => void;
    variant?: 'default' | 'outline' | 'pills';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const FilterTabs = ({ 
    options, 
    activeKey, 
    onSelect, 
    variant = 'default',
    size = 'md',
    className = ''
}: FilterTabsProps) => {
    
    const getVariantClasses = (isActive: boolean) => {
        if (variant === 'outline') {
            return isActive
                ? 'bg-primary text-white border-primary'
                : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700';
        }
        
        if (variant === 'pills') {
            return isActive
                ? 'bg-primary text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600';
        }
        
        // default
        return isActive
            ? 'bg-primary text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700';
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-5 py-2.5 text-lg'
    };

    const variantClasses = {
        default: 'rounded-lg',
        outline: 'rounded-lg border',
        pills: 'rounded-full'
    };

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {options.map((option) => (
                <button
                    key={option.key}
                    onClick={() => onSelect(option.key)}
                    className={`
                        ${sizeClasses[size]}
                        ${variantClasses[variant]}
                        ${getVariantClasses(activeKey === option.key)}
                        transition-all duration-200 font-medium cursor-pointer
                        focus:outline-none focus:ring-2 focus:ring-primary/50
                    `}
                >
                    {option.icon && <span className="mr-1.5">{option.icon}</span>}
                    {option.label}
                </button>
            ))}
        </div>
    );
};

export default FilterTabs;