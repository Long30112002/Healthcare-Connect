interface StatCardProps {
    value: number;
    label: string;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple';
    loading?: boolean;
    suffix?: string; 
}

const colorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    red: 'text-red-600 dark:text-red-400',
    gray: 'text-gray-600 dark:text-gray-400',
    purple: 'text-purple-600 dark:text-purple-400',
};

const StatCard = ({ value, label, color = 'blue', loading = false, suffix = '' }: StatCardProps) => {
    return (
        <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center shadow-sm">
            {loading ? (
                <div className="text-xl sm:text-2xl font-bold animate-pulse">...</div>
            ) : (
                <div className={`text-xl sm:text-2xl font-bold ${colorClasses[color]}`}>
                    {value}{suffix}
                </div>
            )}
            <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">{label}</div>
        </div>
    );
};

export default StatCard;