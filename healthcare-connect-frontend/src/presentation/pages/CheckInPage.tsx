import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../../application/hooks/useAppTranslation';
import { appointmentApi } from '../../infrastructure/api/appointmentApi';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import Button from '../components/shared/Button';
import { toast } from 'react-hot-toast/headless';

const CheckInPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { t } = useAppTranslation();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [appointmentInfo, setAppointmentInfo] = useState<any>(null);

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            toast.error(t('checkin.invalidToken'));
            setStatus('error');
            return;
        }

        const checkIn = async () => {
            try {
                const result = await appointmentApi.checkInByToken(token);
                setAppointmentInfo(result);
                toast.success(t('checkin.success'));
                setStatus('success');
            } catch (error: any) {
                toast.error(error.response?.data?.message || t('checkin.failed'));
                setStatus('error');
            }
        };

        checkIn();
    }, [token]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
                <LoadingSpinner size="lg" text={t('checkin.processing')} />
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h1 className="text-2xl font-bold text-green-600 mb-2">{t('checkin.successTitle')}</h1>
                    <p className="text-gray-600 mb-4">{t('checkin.successMessage')}</p>
                    {appointmentInfo && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                            <p><strong>👨‍⚕️ {t('checkin.doctor')}:</strong> {appointmentInfo.doctorName}</p>
                            <p><strong>🕐 {t('checkin.time')}:</strong> {appointmentInfo.startTime}</p>
                            <p><strong>🚪 {t('checkin.room')}:</strong> {appointmentInfo.roomNumber || 'Chưa xác định'}</p>
                        </div>
                    )}
                    <Button onClick={() => navigate('/')} variant="primary">
                        {t('checkin.backToHome')}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                <div className="text-6xl mb-4">❌</div>
                <h1 className="text-2xl font-bold text-red-600 mb-2">{t('checkin.errorTitle')}</h1>
                <p className="text-gray-600 mb-6">{t('checkin.errorMessage')}</p>
                <p className="text-sm text-gray-500 mb-6">Mã token: {token?.substring(0, 20)}...</p>
                <div className="flex gap-3">
                    <Button onClick={() => navigate('/')} variant="outline">
                        {t('checkin.backToHome')}
                    </Button>
                    <Button onClick={() => window.location.reload()} variant="primary">
                        {t('checkin.retry')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CheckInPage;