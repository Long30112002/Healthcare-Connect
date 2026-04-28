import { useAppTranslation } from '../../../application/hooks/useAppTranslation';

interface StatusBadgeProps {
    status: string;
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
    className?: string;
}

const StatusBadge = ({
    status,
    size = 'md',
    showIcon = true,
    className = ''
}: StatusBadgeProps) => {
    const { t } = useAppTranslation();

    // Map status sang màu sắc
    const getStatusConfig = (status: string) => {
        const statusMap: Record<string, { color: string; label: string; icon: string }> = {
            'CONFIRMED': {
                color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                label: t('status.CONFIRMED'),
                icon: '⏳'
            },
            'IN_PROGRESS': {
                color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                label: t('status.IN_PROGRESS'),
                icon: '🩺'
            },
            'COMPLETED': {
                color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                label: t('status.COMPLETED'),
                icon: '✅'
            },
            'CANCELLED': {
                color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                label: t('status.CANCELLED'),
                icon: '❌'
            },
            'AWAITING_PAYMENT': {
                color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
                label: t('status.AWAITING_PAYMENT'),
                icon: '💳'
            },
            'NO_SHOW': {
                color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
                label: t('status.NO_SHOW'),
                icon: '🚫'
            },
            'RESCHEDULED': {
                color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
                label: t('status.RESCHEDULED'),
                icon: '🔄'
            }
        };

        return statusMap[status] || {
            color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            label: status,
            icon: '📋'
        };
    };

    const sizeClasses = {
        sm: 'px-1.5 py-0.5 text-xs',
        md: 'px-2 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm'
    };

    const config = getStatusConfig(status);

    return (
        <span className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]} ${config.color} ${className}`}>
            {showIcon && <span className="text-sm">{config.icon}</span>}
            <span>{config.label}</span>
        </span>
    );
};

export default StatusBadge;