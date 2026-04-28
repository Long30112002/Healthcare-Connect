interface StatCardProps {
    value: number;
    label: string;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple';
    loading?: boolean;
    suffix?: string;
    size?: 'sm' | 'md';  
}

const colorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    red: 'text-red-600 dark:text-red-400',
    gray: 'text-gray-600 dark:text-gray-400',
    purple: 'text-purple-600 dark:text-purple-400',
};

const StatCard = ({ 
    value, 
    label, 
    color = 'blue', 
    loading = false, 
    suffix = '',
    size = 'md' 
}: StatCardProps) => {
    const sizeClasses = {
        sm: {
            wrapper: 'p-3 sm:p-4',
            value: 'text-xl sm:text-2xl',
            label: 'text-[10px] sm:text-xs',
        },
        md: {
            wrapper: 'p-4',
            value: 'text-2xl',
            label: 'text-sm',
        },
    };

    const currentSize = sizeClasses[size];

    return (
        <div className={`bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl ${currentSize.wrapper} text-center shadow-sm`}>
            {loading ? (
                <div className={`${currentSize.value} font-bold animate-pulse`}>...</div>
            ) : (
                <div className={`${currentSize.value} font-bold ${colorClasses[color]}`}>
                    {value}{suffix}
                </div>
            )}
            <div className={`${currentSize.label} text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1`}>{label}</div>
        </div>
    );
};

export default StatCard;