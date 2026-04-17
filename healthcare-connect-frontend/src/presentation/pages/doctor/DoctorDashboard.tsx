import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import useFetch from '../../../application/hooks/useFetch';
import { formatDateTime, formatPrice } from '../../../shared/utils/dateUtils';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';
import Button from '../../components/shared/Button';
import type { PageResponse } from '../../../core/types/api.response';
import type { Appointment } from '../../../core/types';
import toast from 'react-hot-toast';
import { appointmentApi } from '../../../infrastructure/api/appointmentApi';

type TabKey = 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const { t, getStatus } = useAppTranslation();
    const [activeTab, setActiveTab] = useState<TabKey>('confirmed');
    const [page, setPage] = useState(0);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [isStarting, setIsStarting] = useState<string | null>(null);

    const statusMap: Record<TabKey, string | undefined> = {
        confirmed: 'CONFIRMED',
        in_progress: 'IN_PROGRESS',
        completed: 'COMPLETED',
        cancelled: 'CANCELLED',
    };

    const statusParam = statusMap[activeTab] ? `&status=${statusMap[activeTab]}` : '';
    const url = `/doctor/appointments?page=${page}&size=10${statusParam}`;

    const { data, loading, error, refetch } = useFetch<PageResponse<Appointment>>(
        url,
        'GET',
        {
            immediate: true,
            deps: [page, activeTab]
        }
    );

    const appointments = data?.content ?? [];
    const totalElements = data?.totalElements ?? 0;
    const totalPages = data?.totalPages ?? 0;

    const tabs = [
        { key: 'confirmed' as TabKey, label: t('doctor.tabConfirmed'), icon: '✅', count: 0 },
        { key: 'in_progress' as TabKey, label: t('doctor.tabInProgress'), icon: '🩺', count: 0 },
        { key: 'completed' as TabKey, label: t('doctor.tabCompleted'), icon: '🎉', count: 0 },
        { key: 'cancelled' as TabKey, label: t('doctor.tabCancelled'), icon: '❌', count: 0 },
    ];

    const getStatusBadge = (status: string): string => {
        const map: Record<string, string> = {
            'CONFIRMED': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'IN_PROGRESS': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            'COMPLETED': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'CANCELLED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };
        return map[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    };

    // Xử lý check-in (bệnh nhân đã đến)
    const handleCheckIn = async (appointmentId: string) => {
        setUpdatingId(appointmentId);
        try {
            await appointmentApi.checkIn(appointmentId);
            toast.success(t('doctor.checkInSuccess'));
            refetch();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('doctor.checkInFailed'));
        } finally {
            setUpdatingId(null);
        }
    };


    // Xử lý kết thúc khám
    const handleCompleteExam = async (appointmentId: string) => {
        setUpdatingId(appointmentId);
        try {
            await appointmentApi.completeExam(appointmentId);
            toast.success(t('doctor.completeExamSuccess'));
            refetch();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('doctor.completeExamFailed'));
        } finally {
            setUpdatingId(null);
        }
    };


    // Xem chi tiết bệnh nhân
    const handleViewPatient = (patientId: string) => {
        navigate(`/patients/${patientId}`);
    };

    if (loading && page === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Background Pattern */}
            <div className="fixed inset-0 opacity-5 pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234299e1' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                }} />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-6">
                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl shadow-xl mb-6">
                    <div className="absolute top-0 right-0 opacity-10">
                        <svg className="w-64 h-64" fill="white" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z" />
                        </svg>
                    </div>
                    <div className="relative z-10 p-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-white">
                            👨‍⚕️ {t('doctor.dashboardTitle')}
                        </h1>
                        <p className="text-blue-100 text-sm mt-1">
                            {t('doctor.dashboardSubtitle')}
                        </p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60" className="w-full h-8">
                            <path fill="#f0f9ff" fillOpacity="1" d="M0,32L80,37.3C160,43,320,53,480,48C640,43,800,21,960,21C1120,21,1280,43,1360,53.3L1440,64L1440,60L1360,60C1280,60,1120,60,960,60C800,60,640,60,480,60C320,60,160,60,80,60L0,60Z"></path>
                        </svg>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                    {/* Tabs */}
                    <div className="border-b border-gray-200 dark:border-gray-700 px-4 pt-4">
                        <div className="flex flex-wrap gap-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => {
                                        setActiveTab(tab.key);
                                        setPage(0);
                                    }}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === tab.key
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <span className="flex items-center gap-1">
                                        {tab.icon} {tab.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6">
                        {error && (
                            <div className="text-center py-8">
                                <p className="text-red-500 dark:text-red-400">{error}</p>
                                <button onClick={() => refetch()} className="mt-2 text-primary hover:underline">
                                    {t('common.retry')}
                                </button>
                            </div>
                        )}

                        {!error && appointments.length === 0 && (
                            <EmptyState
                                title={t('doctor.noAppointments')}
                                description={t('doctor.noAppointmentsDesc')}
                                icon="📋"
                            />
                        )}

                        {appointments.length > 0 && (
                            <>
                                <div className="space-y-3">
                                    {appointments.map((apt) => (
                                        <div key={apt.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white">
                                                        👤 {apt.patientName}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        📅 {formatDateTime(apt.startTime)} - {formatDateTime(apt.endTime, 'HH:MM')}
                                                    </p>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(apt.status)}`}>
                                                    {getStatus(apt.status)}
                                                </span>
                                            </div>

                                            {/* Symptoms */}
                                            {apt.symptoms && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                                    💬 {t('doctor.symptoms')}: {apt.symptoms}
                                                </p>
                                            )}

                                            {/* Price */}
                                            <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-3">
                                                💰 {formatPrice(apt.price)} • {apt.paid ? t('doctor.paid') : t('doctor.unpaid')}
                                            </p>

                                            {/* Actions */}
                                            <div className="flex justify-end gap-2">
                                                {apt.status === 'CONFIRMED' && (
                                                    <Button
                                                        size="sm"
                                                        variant="primary"
                                                        onClick={() => handleCheckIn(apt.id)}
                                                        loading={updatingId === apt.id}
                                                    >
                                                        ✅ {t('doctor.checkIn')}
                                                    </Button>
                                                )}
                                                {apt.status === 'IN_PROGRESS' && (
                                                    <Button
                                                        size="sm"
                                                        variant="primary"
                                                        onClick={() => handleCompleteExam(apt.id)}
                                                        loading={updatingId === apt.id}
                                                    >
                                                        🩺 {t('doctor.completeExam')}
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleViewPatient(apt.id)}
                                                >
                                                    📋 {t('doctor.viewDetails')}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-3 mt-6">
                                        <button
                                            onClick={() => setPage(p => Math.max(0, p - 1))}
                                            disabled={page === 0}
                                            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                        >
                                            ← {t('common.previous')}
                                        </button>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {page + 1} / {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                            disabled={page >= totalPages - 1}
                                            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                        >
                                            {t('common.next')} →
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;