import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import useFetch from '../../../application/hooks/useFetch';
import DataWrapper from '../../components/shared/DataWrapper';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';
import { appointmentApi } from '../../../infrastructure/api/appointmentApi';
import type { Appointment } from '../../../core/types';
import { formatDateTime, formatPrice } from '../../../shared/utils/dateUtils';
import toast from 'react-hot-toast';

type TabKey = 'all' | 'awaiting_payment' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

const AppointmentListPage = () => {
    const navigate = useNavigate();
    const { t, getStatus } = useAppTranslation();
    const [activeTab, setActiveTab] = useState<TabKey>('all');
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    // STATE CHO MODAL
    const [cancelModal, setCancelModal] = useState<{
        open: boolean;
        appointmentId: string | null;
        doctorName: string;
        appointmentDate: string;
    }>({
        open: false,
        appointmentId: null,
        doctorName: '',
        appointmentDate: ''
    });

    const {
        data: appointmentsData,
        loading,
        error,
        execute: refreshAppointments
    } = useFetch<{ content: Appointment[]; totalElements: number }>('/appointments/my-bookings', 'GET', {
        immediate: true,
    });

    const appointments = appointmentsData?.content ?? [];
    const totalElements = appointmentsData?.totalElements ?? 0;

    // Filter appointments theo tab
    const filterByTab = (tab: TabKey): Appointment[] => {
        if (tab === 'all') return appointments;

        const statusMap: Record<TabKey, string | null> = {
            all: null,
            awaiting_payment: 'AWAITING_PAYMENT',
            confirmed: 'CONFIRMED',
            in_progress: 'IN_PROGRESS',
            completed: 'COMPLETED',
            cancelled: 'CANCELLED',
        };

        const status = statusMap[tab];
        return appointments.filter(apt => apt.status === status);
    };

    const filteredAppointments = filterByTab(activeTab);

    // Xử lý thanh toán
    const handlePayment = (appointmentId: string) => {
        navigate(`/payment/${appointmentId}`);
    };

    // MỞ MODAL HỦY LỊCH
    const openCancelModal = (appointment: Appointment) => {

        setCancelModal({
            open: true,
            appointmentId: appointment.id,
            doctorName: appointment.doctorName,
            appointmentDate: formatDateTime(appointment.startTime, 'dd/mm/yyyy HH:MM'),
        });
    };

    // XỬ LÝ HỦY LỊCH (SAU KHI XÁC NHẬN)
    const handleConfirmCancel = async () => {
        if (!cancelModal.appointmentId) return;

        setCancellingId(cancelModal.appointmentId);
        try {
            await appointmentApi.cancelAppointment(cancelModal.appointmentId);
            toast.success(t('appointment.cancelSuccess'));
            refreshAppointments();
            setCancelModal({ open: false, appointmentId: null, doctorName: '', appointmentDate: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('appointment.cancelFailed'));
        } finally {
            setCancellingId(null);
        }
    };

    // Xử lý đặt lại lịch
    const handleBookAgain = (doctorId: string | undefined) => {
        if (!doctorId) {
            toast.error(t('appointment.doctorNotFound'));
            return;
        }
        navigate(`/doctors/${doctorId}`);
    };

    // Refresh khi component mount
    useEffect(() => {
        refreshAppointments();
    }, []);

    // Refresh khi WebSocket báo có thay đổi
    useEffect(() => {
        const handleRefresh = () => refreshAppointments();
        window.addEventListener('appointmentUpdated', handleRefresh);
        return () => window.removeEventListener('appointmentUpdated', handleRefresh);
    }, [refreshAppointments]);

    // Refresh khi tab được focus
    useEffect(() => {
        const handleFocus = () => refreshAppointments();
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [refreshAppointments]);

    const tabs = [
        { key: 'all', label: t('page.appointments.tabAll'), icon: '📋' },
        { key: 'awaiting_payment', label: t('page.appointments.tabAwaitingPayment'), icon: '💳' },
        { key: 'confirmed', label: t('page.appointments.tabConfirmed'), icon: '✅' },
        { key: 'in_progress', label: t('page.appointments.tabInProgress'), icon: '🩺' },
        { key: 'completed', label: t('page.appointments.tabCompleted'), icon: '🎉' },
        { key: 'cancelled', label: t('page.appointments.tabCancelled'), icon: '❌' },
    ];

    // Render action buttons theo status
    const renderActions = (appointment: Appointment) => {
        const isCancelling = cancellingId === appointment.id;

        switch (appointment.status) {
            case 'AWAITING_PAYMENT':
                return (
                    <div className="flex gap-2 mt-3 sm:mt-0">
                        <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handlePayment(appointment.id)}
                        >
                            {t('appointment.payNow')}
                        </Button>
                        <Button
                            size="sm"
                            variant="danger"
                            onClick={() => openCancelModal(appointment)}
                            loading={isCancelling}
                        >
                            {t('appointment.cancel')}
                        </Button>
                    </div>
                );

            case 'CONFIRMED':
                return (
                    <div className="flex gap-2 mt-3 sm:mt-0">
                        <Button
                            size="sm"
                            variant="danger"
                            onClick={() => openCancelModal(appointment)}
                            loading={isCancelling}
                        >
                            {t('appointment.cancel')}
                        </Button>
                    </div>
                );

            case 'COMPLETED':
                return (
                    <div className="flex gap-2 mt-3 sm:mt-0">
                        <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleBookAgain(appointment.doctorId)}
                        >
                            {t('appointment.bookAgain')}
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/appointments/${appointment.id}/review`)}
                        >
                            ⭐ {t('appointment.review')}
                        </Button>
                    </div>
                );

            case 'CANCELLED':
                return (
                    <div className="flex gap-2 mt-3 sm:mt-0">
                        <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleBookAgain(appointment.doctorId)}
                        >
                            {t('appointment.bookAgain')}
                        </Button>
                    </div>
                );

            default:
                return null;
        }
    };

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
                {/* Header với gradient */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl shadow-xl mb-6">
                    <div className="absolute top-0 right-0 opacity-10">
                        <svg className="w-64 h-64" fill="white" viewBox="0 0 24 24">
                            <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                        </svg>
                    </div>
                    <div className="relative z-10 p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">
                                    📋 {t('page.appointments.title')}
                                </h1>
                                <p className="text-blue-100 text-sm mt-1">
                                    {t('page.appointments.subtitle')}
                                </p>
                            </div>
                            <button
                                onClick={refreshAppointments}
                                className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition text-sm"
                            >
                                🔄 {t('common.refresh')}
                            </button>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60" className="w-full h-8">
                            <path fill="#f0f9ff" fillOpacity="1" d="M0,32L80,37.3C160,43,320,53,480,48C640,43,800,21,960,21C1120,21,1280,43,1360,53.3L1440,64L1440,60L1360,60C1280,60,1120,60,960,60C800,60,640,60,480,60C320,60,160,60,80,60L0,60Z"></path>
                        </svg>
                    </div>
                </div>

                {/* Card chính */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                    {/* Tabs */}
                    <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto px-4 pt-4 scrollbar-hide">
                        <div className="flex gap-1 sm:gap-2 min-w-max">
                            {tabs.map((tab) => {
                                const count = tab.key === 'all' ? totalElements : appointments.filter(apt =>
                                    (tab.key === 'awaiting_payment' && apt.status === 'AWAITING_PAYMENT') ||
                                    (tab.key === 'confirmed' && apt.status === 'CONFIRMED') ||
                                    (tab.key === 'in_progress' && apt.status === 'IN_PROGRESS') ||
                                    (tab.key === 'completed' && apt.status === 'COMPLETED') ||
                                    (tab.key === 'cancelled' && apt.status === 'CANCELLED')
                                ).length;

                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key as TabKey)}
                                        className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-medium rounded-t-lg transition ${activeTab === tab.key
                                            ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <span className="hidden sm:inline">{tab.icon} {tab.label}</span>
                                        <span className="sm:hidden">{tab.icon}</span>
                                        {count > 0 && (
                                            <span className={`ml-1 sm:ml-2 px-1.5 py-0.5 text-xs rounded-full ${activeTab === tab.key
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                                }`}>
                                                {count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6">
                        <DataWrapper
                            loading={loading}
                            error={error}
                            data={filteredAppointments}
                            onRetry={refreshAppointments}
                            emptyMessage={t('page.appointments.empty')}
                            emptyDescription={t('page.appointments.emptyDesc')}
                            emptyActionText={t('page.appointments.bookNow')}
                            onEmptyAction={() => navigate('/doctors')}
                        >
                            {(data) => (
                                <div className="space-y-3">
                                    {data.map((apt) => (
                                        <div key={apt.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-700">
                                            {/* Hàng 1: Hospital Name và Badge */}
                                            <div className="flex justify-between items-start mb-3">
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    🏥 {apt.hospitalName}
                                                </p>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(apt.status)}`}>
                                                    {getStatus(apt.status)}
                                                </span>
                                            </div>

                                            {/* Hàng 2: Thông tin bác sĩ */}
                                            <p className="text-gray-700 dark:text-gray-300 mb-2">
                                                👨‍⚕️ {apt.doctorName}
                                            </p>

                                            {/* Hàng 3: Triệu chứng (nếu có) */}
                                            {apt.symptoms && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                    💬 {apt.symptoms}
                                                </p>
                                            )}

                                            {/* Hàng 4: Thời gian và giá */}
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                                                <div className="flex items-center gap-1">
                                                    <span>📅</span>
                                                    <span>{formatDateTime(apt.startTime)} - {formatDateTime(apt.endTime, 'HH:MM')}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span>💰</span>
                                                    <span className="font-medium text-green-600 dark:text-green-400">
                                                        {formatPrice(apt.price)}
                                                    </span>
                                                    <span className="text-xs">
                                                        {apt.paid ? `• ${t('appointment.paid')}` : `• ${t('appointment.unpaid')}`}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Hàng 5: Action Buttons */}
                                            <div className="flex justify-end">
                                                {renderActions(apt)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </DataWrapper>
                    </div>
                </div>

                {/* MODAL XÁC NHẬN HỦY LỊCH */}
                <Modal
                    isOpen={cancelModal.open}
                    onClose={() => setCancelModal({ open: false, appointmentId: null, doctorName: '', appointmentDate: '' })}
                    onConfirm={handleConfirmCancel}
                    title={t('appointment.cancelConfirmTitle')}
                    message={t('appointment.cancelConfirmMessage')}
                    variant="danger"
                    confirmText={t('appointment.cancel')}
                    cancelText={t('common.cancel')}
                    loading={cancellingId !== null}
                >
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            👨‍⚕️ <span className="font-medium">{cancelModal.doctorName}</span>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            📅 {cancelModal.appointmentDate}
                        </p>
                    </div>
                    <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-3">
                        ⚠️ {t('appointment.cancelWarning')}
                    </p>
                </Modal>
            </div>
        </div>
    );
};

// Helper function cho badge màu
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

export default AppointmentListPage;