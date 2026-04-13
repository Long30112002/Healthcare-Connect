import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import Button from '../../components/shared/Button';
import toast from 'react-hot-toast';

const PaymentResultPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { t } = useAppTranslation();
    const [countdown, setCountdown] = useState(3);
    
    const resultCode = searchParams.get('resultCode');
    const message = searchParams.get('message');
    const orderId = searchParams.get('orderId');
    const transactionId = searchParams.get('transId');
    
    const isSuccess = resultCode === '0';
    
    useEffect(() => {
        if (isSuccess) {
            toast.success(t('payment.success'));
        } else {
            toast.error(message || t('payment.failed'));
        }
        
        // Đếm ngược để chuyển trang
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/appointments');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        return () => clearInterval(timer);
    }, [isSuccess, message, navigate, toast, t]);
    
    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-4 max-w-md">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                        {/* Icon thành công */}
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {t('payment.successTitle')}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {t('payment.successMessage')}
                        </p>
                        
                        {orderId && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                {t('payment.orderId')}: {orderId.substring(0, 15)}...
                            </p>
                        )}
                        
                        {transactionId && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                                {t('payment.transactionId')}: {transactionId}
                            </p>
                        )}
                        
                        <div className="space-y-3">
                            <Button
                                onClick={() => navigate('/appointments')}
                                variant="primary"
                                size="lg"
                                fullWidth
                            >
                                {t('payment.viewAppointments')}
                            </Button>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                {t('payment.redirecting')} {countdown}s
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 max-w-md">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                    {/* Icon thất bại */}
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {t('payment.failedTitle')}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {message || t('payment.failedMessage')}
                    </p>
                    
                    <div className="space-y-3">
                        <Button
                            onClick={() => navigate(-1)}
                            variant="primary"
                            size="lg"
                            fullWidth
                        >
                            {t('payment.tryAgain')}
                        </Button>
                        <Button
                            onClick={() => navigate('/appointments')}
                            variant="outline"
                            size="lg"
                            fullWidth
                        >
                            {t('payment.viewAppointments')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentResultPage;