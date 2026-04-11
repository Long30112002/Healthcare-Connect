import { Link } from 'react-router-dom';

interface SectionHeaderProps {
    title: string;
    icon?: string;
    viewAllLink?: string;
    onViewAll?: () => void;
    viewAllText?: string;
}

const SectionHeader = ({ 
    title, 
    icon, 
    viewAllLink, 
    onViewAll, 
    viewAllText = 'Xem tất cả' 
}: SectionHeaderProps) => {
    return (
        <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
                {icon && <span className="text-2xl">{icon}</span>}
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
                    {title}
                </h2>
            </div>
            {(viewAllLink || onViewAll) && (
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition">
                    {viewAllLink ? (
                        <Link to={viewAllLink} className="flex items-center gap-1">
                            {viewAllText} 
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    ) : (
                        <button onClick={onViewAll} className="flex items-center gap-1">
                            {viewAllText}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default SectionHeader;