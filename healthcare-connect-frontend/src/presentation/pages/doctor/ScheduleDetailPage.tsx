import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import Button from '../../../presentation/components/shared/Button';
import LoadingSpinner from '../../../presentation/components/shared/LoadingSpinner';
import StatusBadge from '../../../presentation/components/shared/StatusBadge';
import { doctorApi } from '../../../infrastructure/api/doctorApi';
import { formatDateShort, formatTimeOnly, formatPrice } from '../../../shared/utils/dateUtils';
import toast from 'react-hot-toast';
import type { ScheduleRespone } from '../../../core/types/api.response';

const ScheduleDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { t } = useAppTranslation();
    const [loading, setLoading] = useState(true);
    const [schedule, setSchedule] = useState<ScheduleRespone | null>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await doctorApi.getScheduleDetail(id);
                setSchedule(data);
            } catch (error) {
                toast.error(t('common.loadError'));
                navigate('/my-schedule');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id, navigate, t]);

    const getScheduleType = () => {
        if (!schedule) return 'future';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const scheduleDate = new Date(schedule.date[0], schedule.date[1] - 1, schedule.date[2]);
        if (scheduleDate < today) return 'past';
        if (scheduleDate.getTime() === today.getTime()) return 'today';
        return 'future';
    };

    if (loading) {
        return <LoadingSpinner fullScreen variant="dots" text={t('common.loading')} />;
    }

    if (!schedule) {
        return null;
    }

    const scheduleType = getScheduleType();
    const canEdit = schedule.status === 'AVAILABLE' && schedule.currentBookings === 0 && scheduleType === 'future';

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-6 max-w-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">📅</span>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {t('scheduleDetail.title')}
                            </h1>
                            <p className="text-blue-100 text-sm mt-1">
                                {t('scheduleDetail.subtitle')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Detail Card */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 space-y-4">
                        {/* Thông tin cơ bản */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">{t('scheduleDetail.date')}</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {formatDateShort(schedule.date)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('scheduleDetail.time')}</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {formatTimeOnly(schedule.startTime)} - {formatTimeOnly(schedule.endTime)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('scheduleDetail.price')}</p>
                                <p className="font-medium text-green-600 dark:text-green-400">
                                    {formatPrice(schedule.price)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('scheduleDetail.patients')}</p>
                                <p className="font-medium">
                                    {schedule.currentBookings} / {schedule.maxPatients}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('scheduleDetail.room')}</p>
                                <p className="font-medium">
                                    {schedule.roomNumber || t('mySchedule.notAssigned')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('scheduleDetail.status')}</p>
                                <div className="mt-1">
                                    <StatusBadge status={schedule.status} size="md" />
                                </div>
                            </div>
                        </div>

                        {/* Warning nếu lịch đã qua hoặc hôm nay */}
                        {scheduleType === 'today' && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                    ⏰ {t('scheduleDetail.todayWarning')}
                                </p>
                            </div>
                        )}
                        {scheduleType === 'past' && (
                            <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-3">
                                <p className="text-sm text-gray-500">
                                    📅 {t('scheduleDetail.pastWarning')}
                                </p>
                            </div>
                        )}
                        {schedule.currentBookings > 0 && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                                <p className="text-sm text-blue-600 dark:text-blue-400">
                                    👥 {t('scheduleDetail.hasBookings', { count: schedule.currentBookings })}
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">
                                ← {t('common.back')}
                            </Button>
                            {canEdit && (
                                <Button variant="primary" onClick={() => navigate(`/doctor/schedules/${schedule.id}/edit`)} className="flex-1">
                                    ✏️ {t('common.edit')}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleDetailPage;