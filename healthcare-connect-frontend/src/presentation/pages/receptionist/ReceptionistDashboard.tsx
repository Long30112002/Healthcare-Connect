import { useState, useEffect, useCallback } from 'react';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { useTabWithUrl } from '../../../application/hooks/useTabWithUrl';
import { receptionistApi } from '../../../infrastructure/api/receptionistApi';
import { formatDateTime } from '../../../shared/utils/dateUtils';
import toast from 'react-hot-toast';
import { DashboardHeader, DashboardStats, DashboardSearch, AppointmentCard } from '../../components/medical-dashboard';
import FilterTabs from '../../../presentation/components/shared/FilterTabs';
import Pagination from '../../../presentation/components/shared/Pagination';
import Button from '../../../presentation/components/shared/Button';
import LoadingSpinner from '../../../presentation/components/shared/LoadingSpinner';
import EmptyState from '../../../presentation/components/shared/EmptyState';
import Modal from '../../../presentation/components/shared/Modal';
import CreateOfflineAppointmentModal from './CreateOfflineAppointmentModal';
import CancelAppointmentModal from './CancelAppointmentModal';
import type { Appointment } from '../../../core/types';
import { PaymentMethod, RefundMethod } from '../../../core/constants/enums';
import type { DashboardStatistics } from '../../../core/types/api.response';

type FilterKey = 'today' | 'tomorrow' | 'week' | 'all';

const PAGE_SIZE = 5;

const ReceptionistDashboard = () => {
    const { t } = useAppTranslation();

    const { activeTab: activeFilter, setActiveTab: setActiveFilter, page, setPage, apiPage } = useTabWithUrl({
        paramName: 'filter',
        validValues: ['today', 'tomorrow', 'week', 'all'],
        defaultValue: 'today',
        pageZeroBased: false
    });

    // State cơ bản
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [checkingId, setCheckingId] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [hospitalName, setHospitalName] = useState('');
    const [cancelModal, setCancelModal] = useState<{
        open: boolean;
        appointmentId: string | null;
        patientName: string;
        appointmentPrice: number;
        paymentMethod: PaymentMethod;
        isPaid: boolean;
    }>({
        open: false,
        appointmentId: null,
        patientName: '',
        appointmentPrice: 0,
        paymentMethod: PaymentMethod.MOMO,
        isPaid: false
    });
    const [qrModal, setQrModal] = useState<{ open: boolean; payUrl: string; qrCodeUrl: string }>({
        open: false,
        payUrl: '',
        qrCodeUrl: ''
    });
    const [cancelling, setCancelling] = useState(false);

    // State thống kê
    const [stats, setStats] = useState<DashboardStatistics>({
        upcoming: 0, waiting: 0, checkedIn: 0, completed: 0, cancelled: 0, noShow: 0, total: 0
    });
    const [statsLoading, setStatsLoading] = useState(true);

    // Filter options
    const filterOptions = [
        { key: 'today' as FilterKey, label: t('receptionist.filterToday'), icon: '📅' },
        { key: 'tomorrow' as FilterKey, label: t('receptionist.filterTomorrow'), icon: '⏰' },
        { key: 'week' as FilterKey, label: t('receptionist.filterWeek'), icon: '📆' },
        { key: 'all' as FilterKey, label: t('receptionist.filterAll'), icon: '📋' },
    ];

    const getStatsData = () => {
        if (activeFilter !== 'tomorrow' && activeFilter !== 'all') {
            return [
                { value: stats.waiting, label: t('receptionist.waiting'), color: 'yellow' as const, loading: statsLoading },
                { value: stats.checkedIn, label: t('receptionist.checkedIn'), color: 'green' as const, loading: statsLoading },
                { value: stats.completed, label: t('receptionist.completed'), color: 'blue' as const, loading: statsLoading },
                { value: stats.cancelled, label: t('receptionist.cancelled'), color: 'red' as const, loading: statsLoading },
                { value: stats.noShow, label: t('receptionist.noShow'), color: 'gray' as const, loading: statsLoading },
            ];
        } else if (activeFilter === 'tomorrow') {
            return [
                { value: stats.waiting, label: t('receptionist.expected'), color: 'yellow' as const, loading: statsLoading },
                { value: stats.cancelled, label: t('receptionist.cancelled'), color: 'red' as const, loading: statsLoading },
            ];
        } else {
            return [
                { value: stats.total, label: t('receptionist.total'), color: 'blue' as const, loading: statsLoading },
                { value: stats.upcoming, label: t('receptionist.upcoming'), color: 'purple' as const, loading: statsLoading },
                { value: stats.completed, label: t('receptionist.completed'), color: 'green' as const, loading: statsLoading },
                { value: stats.cancelled, label: t('receptionist.cancelled'), color: 'red' as const, loading: statsLoading },
                { value: stats.noShow, label: t('receptionist.noShow'), color: 'gray' as const, loading: statsLoading },
            ];
        }
    };

    // Fetch functions
    const fetchStatistics = useCallback(async () => {
        setStatsLoading(true);
        try {
            const data = await receptionistApi.getDashboardStatistics(activeFilter);
            setStats(data);
        } catch {
            toast.error(t('receptionist.loadStatsError'));
        } finally {
            setStatsLoading(false);
        }
    }, [activeFilter, t]);

    const fetchHospitalInfo = async () => {
        try {
            const hospital = await receptionistApi.getCurrentHospital();
            setHospitalName(hospital.name);
        } catch (error) {
            console.error('Failed to fetch hospital info:', error);
        }
    };

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await receptionistApi.getAppointments(activeFilter, apiPage, PAGE_SIZE);
            setAppointments(response.content || []);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch {
            toast.error(t('receptionist.loadError'));
        } finally {
            setLoading(false);
        }
    }, [activeFilter, apiPage, t]);

    // Effects
    useEffect(() => {
        fetchHospitalInfo();
    }, []);

    useEffect(() => {
        fetchStatistics();
        fetchAppointments();
    }, [activeFilter, apiPage, fetchStatistics, fetchAppointments]);

    // Handlers
    const handleFilterChange = (filter: FilterKey) => {
        setActiveFilter(filter);
        setSearchTerm('');
    };

    const handleCheckIn = async (appointmentId: string) => {
        setCheckingId(appointmentId);
        try {
            await receptionistApi.checkIn(appointmentId);
            toast.success(t('receptionist.checkInSuccess'));
            fetchAppointments();
            fetchStatistics();
        } catch {
            toast.error(t('receptionist.checkInError'));
        } finally {
            setCheckingId(null);
        }
    };

    const handleCancelAppointment = async (data: { reason: string; refundMethod: RefundMethod; refundAmount?: number }) => {
        if (!cancelModal.appointmentId) return;
        setCancelling(true);
        try {
            await receptionistApi.cancelAppointment(cancelModal.appointmentId, data);
            toast.success(t('receptionist.cancelSuccess'));
            fetchAppointments();
            fetchStatistics();
            setCancelModal({ ...cancelModal, open: false });
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('receptionist.cancelError'));
        } finally {
            setCancelling(false);
        }
    };

    const handleOpenQR = async (appointmentId: string) => {
        try {
            const response = await receptionistApi.getPaymentQR(appointmentId);
            setQrModal({ open: true, payUrl: response.payUrl, qrCodeUrl: response.qrCodeUrl });
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('receptionist.openQRError'));
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    // Filter appointments by search term
    const getFilteredAppointments = () => {
        if (!searchTerm) return appointments;
        return appointments.filter(apt =>
            apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.phone?.includes(searchTerm)
        );
    };

    // Check if can check-in
    const canCheckIn = (appointment: Appointment): boolean => {
        if (appointment.status !== 'CONFIRMED') return false;
        const appointmentDate = new Date(
            appointment.startTime[0],
            appointment.startTime[1] - 1,
            appointment.startTime[2]
        );
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return appointmentDate.getTime() === today.getTime();
    };

    const filteredAppointments = getFilteredAppointments();

    const renderActions = (apt: Appointment) => {
        const actions = [];

        // Nút mở QR cho AWAITING_PAYMENT
        if (apt.status === 'AWAITING_PAYMENT') {
            actions.push(
                <Button key="qr" size="sm" variant="outline" onClick={() => handleOpenQR(apt.id)}>
                    🟣 {t('receptionist.openQR')}
                </Button>
            );
        }

        // Nút hủy lịch
        if (apt.status !== 'CANCELLED') {
            actions.push(
                <Button
                    key="cancel"
                    size="sm"
                    variant="danger"
                    onClick={() => setCancelModal({
                        open: true,
                        appointmentId: apt.id,
                        patientName: apt.patientName || '',
                        appointmentPrice: apt.price,
                        paymentMethod: apt.paymentMethod === 'MOMO' ? PaymentMethod.MOMO : PaymentMethod.CASH,
                        isPaid: apt.paid
                    })}
                >
                    ❌ {t('common.cancel')}
                </Button>
            );
        }

        // Nút check-in cho CONFIRMED (nếu đúng ngày)
        if (apt.status === 'CONFIRMED') {
            if (canCheckIn(apt)) {
                actions.push(
                    <Button key="checkin" size="sm" variant="primary" onClick={() => handleCheckIn(apt.id)} loading={checkingId === apt.id}>
                        ✅ {t('receptionist.checkIn')}
                    </Button>
                );
            } else {
                actions.push(
                    <span key="wait" className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-lg text-sm">
                        📅 {t('receptionist.waitForExamDate')}
                    </span>
                );
            }
        }
        return <div className="flex justify-end gap-2 flex-wrap">{actions}</div>;
    };

    if (loading && page === 1) {
        return <LoadingSpinner fullScreen size="lg" />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-6">
                {/* Header */}
                <DashboardHeader
                    icon="👩‍⚕️"
                    title={t('receptionist.title')}
                    subtitle={t('receptionist.subtitle')}
                    showHospital={true}
                    hospitalName={hospitalName}
                />

                {/* Filter Tabs */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl shadow-sm mb-6">
                    <div className="p-2">
                        <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide py-1">
                                <FilterTabs
                                    options={filterOptions}
                                    activeKey={activeFilter}
                                    onSelect={(key) => handleFilterChange(key as FilterKey)}
                                    variant="default"
                                    size="md"
                                    className="min-w-max"
                                />
                            </div>

                            <Button
                                variant="primary"
                                onClick={() => setShowCreateModal(true)}
                                size="sm"
                                className="flex-shrink-0"
                            >
                                📝 <span className="hidden xs:inline">{t('receptionist.createNew')}</span>
                                <span className="xs:hidden"></span>
                            </Button>
                        </div>
                    </div>
                </div>

                <CreateOfflineAppointmentModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        fetchAppointments();
                        fetchStatistics();
                    }}
                />

                {/* Stats Cards */}
                <DashboardStats stats={getStatsData()} />

                {/* Search */}
                <DashboardSearch
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    searchPlaceholder={t('receptionist.searchPlaceholder')}
                />

                {/* Appointments List */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-900 dark:text-white">
                        {t('receptionist.appointments')} ({filteredAppointments.length})
                    </div>

                    <div className="p-4">
                        {loading ? (
                            <div className="py-12 flex justify-center">
                                <LoadingSpinner size="lg" />
                            </div>
                        ) : filteredAppointments.length === 0 ? (
                            <EmptyState
                                title={t('receptionist.noAppointments')}
                                description={t('receptionist.noAppointmentsDesc')}
                                icon="📭"
                            />
                        ) : (
                            <>
                                <div className="space-y-3">
                                    {filteredAppointments.map((apt) => (
                                        <AppointmentCard
                                            key={apt.id}
                                            appointment={apt}
                                            actions={renderActions(apt)}
                                        />
                                    ))}
                                </div>

                                {/* Additional info for IN_PROGRESS (check-in time) */}
                                {filteredAppointments.some(apt => apt.status === 'IN_PROGRESS' && apt.checkInTime) && (
                                    <div className="mt-4 space-y-2">
                                        {filteredAppointments.filter(apt => apt.status === 'IN_PROGRESS' && apt.checkInTime).map(apt => (
                                            <div key={apt.id} className="text-xs text-gray-500">
                                                ✅ {apt.patientName}: {apt.checkInTime ? formatDateTime(apt.checkInTime, 'HH:MM') : '---'}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-6">
                                        <Pagination
                                            currentPage={page}
                                            totalPages={totalPages}
                                            onPageChange={handlePageChange}
                                            showJumpToPage={true}
                                            showFirstLast={true}
                                            showPrevNext={true}
                                            showPageIndicator={true}
                                            size="md"
                                            variant="default"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Cancel Appointment Modal */}
                <CancelAppointmentModal
                    isOpen={cancelModal.open}
                    onClose={() => setCancelModal({ ...cancelModal, open: false })}
                    onConfirm={handleCancelAppointment}
                    appointmentPrice={cancelModal.appointmentPrice}
                    paymentMethod={cancelModal.paymentMethod}
                    patientName={cancelModal.patientName}
                    isPaid={cancelModal.isPaid}
                    loading={cancelling}
                />

                {/* QR Modal */}
                <Modal
                    isOpen={qrModal.open}
                    onClose={() => setQrModal({ open: false, payUrl: '', qrCodeUrl: '' })}
                    title={t('payment.scanQRCode')}
                    message={t('payment.pleaseScanQR')}
                    showConfirm={false}
                    showCancel={true}
                    cancelText={t('common.close')}
                    size="lg"
                >
                    <div className="flex flex-col items-center p-2">
                        <iframe
                            src={qrModal.payUrl}
                            title="MoMo Payment"
                            className="w-full h-[500px] rounded-lg border-0"
                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
                            ⏳ {t('payment.waitingForPayment')}
                        </p>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default ReceptionistDashboard;