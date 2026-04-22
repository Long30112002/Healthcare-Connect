interface StatCardProps {
    value: number;
    label: string;
    color: 'yellow' | 'green' | 'blue' | 'red' | 'gray' | 'purple';
    loading: boolean;
}

const colorClasses = {
    yellow: 'text-yellow-600 dark:text-yellow-400',
    green: 'text-green-600 dark:text-green-400',
    blue: 'text-blue-600 dark:text-blue-400',
    red: 'text-red-600 dark:text-red-400',
    gray: 'text-gray-600 dark:text-gray-400',
    purple: 'text-purple-600 dark:text-purple-400',
};

const StatCard = ({ value, label, color, loading }: StatCardProps) => {
    return (
        <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm">
            {loading ? (
                <div className="text-2xl font-bold animate-pulse">...</div>
            ) : (
                <div className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</div>
            )}
            <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
        </div>
    );
};

export default StatCard;