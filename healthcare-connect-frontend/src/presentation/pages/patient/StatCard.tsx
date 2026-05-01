import { Link } from 'react-router-dom';

interface StatCardProps {
    icon: string;
    title: string;
    count: number;
    linkTo?: string;
    onClick?: () => void;
    detailText?: string;
    gradient?: string;
}

const StatCard = ({ 
    icon, 
    title, 
    count, 
    linkTo, 
    onClick, 
    detailText = 'Xem chi tiết',
    gradient = 'from-blue-500 to-cyan-500'
}: StatCardProps) => {
    const content = (
        <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* Gradient top bar */}
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient}`}></div>
            
            <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-4xl">{icon}</div>
                    <div className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                        {count.toLocaleString()}
                    </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{title}</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                    {detailText} 
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </div>
    );

    if (linkTo) return <Link to={linkTo}>{content}</Link>;
    if (onClick) return <button onClick={onClick} className="w-full">{content}</button>;
    return content;
};

export default StatCard;