import React from 'react';

interface DashboardSearchProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder: string;
    showStatusFilter?: boolean;
    statusFilter?: string;
    statusOptions?: { value: string; label: string; icon: string }[];
    onStatusFilterChange?: (value: string) => void;
}

const DashboardSearch: React.FC<DashboardSearchProps> = ({
    searchTerm,
    onSearchChange,
    searchPlaceholder,
    showStatusFilter = false,
    statusFilter,
    statusOptions = [],
    onStatusFilterChange
}) => {
    return (
        <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        className="w-full p-2 sm:p-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
                {showStatusFilter && statusOptions.length > 0 && (
                    <div className="sm:w-48">
                        <select
                            value={statusFilter}
                            onChange={(e) => onStatusFilterChange?.(e.target.value)}
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white bg-white cursor-pointer"
                        >
                            {statusOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.icon} {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardSearch;