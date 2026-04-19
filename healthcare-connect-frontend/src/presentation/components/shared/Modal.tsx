import { useEffect, type ReactNode } from 'react';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import Button from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title?: string;
    message?: string;
    icon?: ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: 'primary' | 'danger' | 'warning' | 'info';
    loading?: boolean;
    children?: ReactNode;
    showConfirm?: boolean;
    showCancel?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}


const Modal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    icon,
    confirmText,
    cancelText,
    variant = 'primary',
    loading = false,
    children,
    showConfirm = true,
    showCancel = true,
    size = 'md',
}: ModalProps) => {
    const { t } = useAppTranslation();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        full: 'max-w-[90vw]',
    };

    const variantStyles = {
        primary: 'bg-blue-100 dark:bg-blue-900/30 text-blue-500',
        danger: 'bg-red-100 dark:bg-red-900/30 text-red-500',
        warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500',
        info: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-500',
    };

    const buttonVariant: Record<string, 'primary' | 'danger' | 'warning' | 'outline'> = {
        primary: 'primary',
        danger: 'danger',
        warning: 'warning',
        info: 'primary',
    };

    const IconComponent = () => {
        if (icon) return <>{icon}</>;

        switch (variant) {
            case 'danger':
                return (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                );
            case 'info':
                return (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
        }
    };

    // Giá trị mặc định với i18n
    const defaultTitle = {
        primary: t('modal.defaultTitle.success'),
        danger: t('modal.defaultTitle.danger'),
        warning: t('modal.defaultTitle.warning'),
        info: t('modal.defaultTitle.info'),
    };

    const defaultMessage = {
        primary: t('modal.defaultMessage.success'),
        danger: t('modal.defaultMessage.danger'),
        warning: t('modal.defaultMessage.warning'),
        info: t('modal.defaultMessage.info'),
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full ${sizeClasses[size]} animate-fade-in-up`}>
                {/* Icon */}
                <div className="flex justify-center pt-6">
                    <div className={`w-16 h-16 rounded-full ${variantStyles[variant]} flex items-center justify-center`}>
                        <IconComponent />
                    </div>
                </div>

                {/* Title */}
                <div className="text-center mt-4 px-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {title || defaultTitle[variant]}
                    </h3>
                </div>

                {/* Message */}
                <div className="text-center mt-2 px-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {message || defaultMessage[variant]}
                    </p>
                </div>

                {/* Custom Content */}
                {children && (
                    <div className="mt-4 px-6">
                        {children}
                    </div>
                )}

                {/* Buttons */}
                <div className={`flex gap-3 p-6 ${showConfirm && showCancel ? 'pt-4' : ''}`}>
                    {showCancel && (
                        <Button
                            onClick={onClose}
                            variant="outline"
                            size="md"
                            fullWidth
                            disabled={loading}
                        >
                            {cancelText || t('common.cancel')}
                        </Button>
                    )}
                    {showConfirm && onConfirm && (
                        <Button
                            onClick={onConfirm}
                            variant={buttonVariant[variant] as any}
                            size="md"
                            fullWidth
                            loading={loading}
                        >
                            {confirmText || t('common.confirm')}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;