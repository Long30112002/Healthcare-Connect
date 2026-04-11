import { Link } from "react-router-dom";

interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    actionText?: string;
    onAction?: () => void;
    actionLink?: string;
}

const EmptyState = ({ icon = '📭', title, description, actionText, onAction, actionLink }: EmptyStateProps) => {
    const content = (
        <div className="text-center py-8">
            <div className="text-6xl mb-3">{icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
            {description && <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>}
            {actionText && (onAction || actionLink) && (
                <div className="mt-4">
                    {onAction && (
                        <button onClick={onAction} className="text-sm text-primary hover:text-blue-700 font-medium">
                            {actionText} →
                        </button>
                    )}
                    {actionLink && (
                        <Link to={actionLink} className="text-sm text-primary hover:text-blue-700 font-medium">
                            {actionText} →
                        </Link>
                    )}
                </div>
            )}
        </div>
    );

    return content;
};

export default EmptyState;