import React from 'react';
import StatCard from '../shared/StatCard';

export interface StatItem {
    value: number;
    label: string;
    color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
    suffix?: string;
    loading?: boolean;
}

interface DashboardStatsProps {
    stats: StatItem[];
    className?: string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, className = '' }) => {
    if (!stats.length) return null;

    return (
        <div className={`grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6 ${className}`}>
            {stats.map((stat, index) => (
                <StatCard
                    key={index}
                    value={stat.value}
                    label={stat.label}
                    color={stat.color}
                    suffix={stat.suffix}
                    loading={stat.loading}
                />
            ))}
        </div>
    );
};

export default DashboardStats;