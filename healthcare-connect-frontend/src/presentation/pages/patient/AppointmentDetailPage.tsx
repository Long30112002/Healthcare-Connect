import { useParams, useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import useFetch from '../../../application/hooks/useFetch';
import { formatDateTime, formatPrice } from '../../../shared/utils/dateUtils';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Button from '../../components/shared/Button';
import type { Appointment } from '../../../core/types';

const AppointmentDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useAppTranslation();

    const { data: appointment, loading, error } = useFetch<Appointment>(
        `/appointments/${id}`,
        'GET',
        { immediate: true }
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !appointment) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{t('common.notFound')}</p>
                    <Button onClick={() => navigate(-1)}>{t('common.back')}</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-6 max-w-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">📋</span>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {t('appointment.detailTitle')}
                            </h1>
                            <p className="text-blue-100 text-sm mt-1">
                                #{appointment.id.slice(0, 8)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 space-y-4">
                        {/* Hospital */}
                        <div className="border-b dark:border-gray-700 pb-3">
                            <p className="text-sm text-gray-500 dark:text-gray-400">🏥 {t('common.hospital')}</p>
                            <p className="font-medium text-gray-900 dark:text-white">{appointment.hospitalName}</p>
                        </div>

                        {/* Doctor */}
                        <div className="border-b dark:border-gray-700 pb-3">
                            <p className="text-sm text-gray-500 dark:text-gray-400">👨‍⚕️ {t('common.doctorName')}</p>
                            <p className="font-medium text-gray-900 dark:text-white">{appointment.doctorName}</p>
                        </div>

                        {/* Time */}
                        <div className="border-b dark:border-gray-700 pb-3">
                            <p className="text-sm text-gray-500 dark:text-gray-400">⏰ {t('appointment.time')}</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {formatDateTime(appointment.startTime, 'dd/mm/yyyy HH:MM')} - {formatDateTime(appointment.endTime, 'HH:MM')}
                            </p>
                        </div>

                        {/* Price */}
                        <div className="border-b dark:border-gray-700 pb-3">
                            <p className="text-sm text-gray-500 dark:text-gray-400">💰 {t('schedule.price')}</p>
                            <p className="font-medium text-green-600 dark:text-green-400">
                                {formatPrice(appointment.price)} • {appointment.paid ? t('common.paid') : t('common.unpaid')}
                            </p>
                        </div>

                        {/* Status */}
                        <div className="border-b dark:border-gray-700 pb-3">
                            <p className="text-sm text-gray-500 dark:text-gray-400">📌 {t('common.status')}</p>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(appointment.status)}`}>
                                {t(`status.${appointment.status}`)}
                            </span>
                        </div>

                        {/* Symptoms */}
                        {appointment.symptoms && (
                            <div className="border-b dark:border-gray-700 pb-3">
                                <p className="text-sm text-gray-500 dark:text-gray-400">💬 {t('doctor.symptoms')}</p>
                                <p className="text-gray-700 dark:text-gray-300">{appointment.symptoms}</p>
                            </div>
                        )}

                        {/* Room */}
                        {appointment.roomNumber && (
                            <div className="border-b dark:border-gray-700 pb-3">
                                <p className="text-sm text-gray-500 dark:text-gray-400">🚪 {t('receptionist.room')}</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {appointment.roomNumber} {appointment.roomFloor ? `- Tầng ${appointment.roomFloor}` : ''}
                                </p>
                            </div>
                        )}

                        {/* Cancel Reason */}
                        {appointment.cancelReason && (
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                                <p className="text-sm text-red-600 dark:text-red-400">❌ {t('cancel.reason')}</p>
                                <p className="text-sm text-red-700 dark:text-red-300">{appointment.cancelReason}</p>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" onClick={() => navigate(-1)} fullWidth>
                                ← {t('common.back')}
                            </Button>
                            {appointment.status === 'AWAITING_PAYMENT' && (
                                <Button variant="primary" onClick={() => navigate(`/payment/${appointment.id}`)} fullWidth>
                                    💳 {t('appointment.payNow')}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const getStatusBadge = (status: string): string => {
    const statusMap: Record<string, string> = {
        'AWAITING_PAYMENT': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        'CONFIRMED': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        'IN_PROGRESS': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        'COMPLETED': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        'CANCELLED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

export default AppointmentDetailPage;