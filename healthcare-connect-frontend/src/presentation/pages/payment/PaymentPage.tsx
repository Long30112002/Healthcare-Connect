import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Button from '../../components/shared/Button';
import toast from 'react-hot-toast';
import { paymentApi } from '../../../infrastructure/api/paymentApi';
import usePaymentWebSocket from '../../../application/hooks/usePaymentWebSocket';

const PaymentPage = () => {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();
    const { t } = useAppTranslation();
    const [loading, setLoading] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [hasInit, setHasInit] = useState(false);

    const { isProcessing } = usePaymentWebSocket(appointmentId || '', () => {
        setIsRedirecting(true);
        toast.success(t('payment.successTitle'));
        setTimeout(() => {
            navigate('/appointments');
        }, 500);
    });

    useEffect(() => {
        if (!appointmentId) {
            toast.error(t('payment.invalidAppointment'));
            navigate('/appointments');
            return;
        }

        if (!appointmentId || hasInit) return;
        setHasInit(true);

        const initPayment = async () => {
            setLoading(true);
            try {
                const existingPayment = await paymentApi.checkPaymentStatus(appointmentId);

                if (existingPayment.payUrl) {
                    setPaymentUrl(existingPayment.payUrl);
                } else {
                    const payUrl = await paymentApi.createPayment(appointmentId);
                    if (payUrl && payUrl.startsWith('http')) {
                        setPaymentUrl(payUrl);
                    } else {
                        toast.error(t('payment.createFailed'));
                    }
                }
            } catch (error: any) {
                console.error('Payment error:', error);
                toast.error(error.response?.data?.message || t('payment.createFailed'));
            } finally {
                setLoading(false);
            }
        };

        initPayment();
    }, [appointmentId, navigate, t]);

    if (isRedirecting || isProcessing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <LoadingSpinner
                    size="lg"
                    text={t('payment.redirecting')}
                    variant="circle"
                />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <LoadingSpinner size="lg" text={t('payment.processing')} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                    <div className="p-6 text-center">
                        <div className="text-6xl mb-4">💳</div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            {t('payment.title')}
                        </h1>

                        {paymentUrl && (
                            <>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    {t('payment.clickToPay')}
                                </p>
                                <Button
                                    onClick={() => window.open(paymentUrl, '_blank')}
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                >
                                    {t('payment.payNow')}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;