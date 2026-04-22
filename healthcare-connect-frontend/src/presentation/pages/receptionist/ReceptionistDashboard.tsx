import { useState, useEffect } from 'react';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { receptionistApi } from '../../../infrastructure/api/receptionistApi';
import { formatDateTime, formatPrice } from '../../../shared/utils/dateUtils';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Button from '../../components/shared/Button';
import type { Appointment } from '../../../core/types';
import type { DashboardStatistics, PageResponse } from '../../../core/types/api.response';
import toast from 'react-hot-toast';
import CreateOfflineAppointmentModal from './CreateOfflineAppointmentModal';
import { PaymentMethod, RefundMethod } from '../../../core/constants/enums';
import CancelAppointmentModal from './CancelAppointmentModal';
import Modal from '../../components/shared/Modal';
import StatCard from './StatCard';
import { useSearchParams } from 'react-router-dom';
import Pagination from '../../components/shared/Pagination';
import StatusBadge from '../../components/shared/StatusBadge';
import FilterTabs, { type FilterOption } from '../../components/shared/FilterTabs';

type FilterKey = 'today' | 'tomorrow' | 'week' | 'all';
type StatusFilter = 'all' | 'waiting' | 'checkedIn' | 'completed';

const PAGE_SIZE = 5;

const ReceptionistDashboard = () => {
    const { t } = useAppTranslation();
    const [searchParams, setSearchParams] = useSearchParams();

    //ĐỌC FILTER TỪ URL
    const getInitialFilter = (): FilterKey => {
        const filter = searchParams.get('filter') as FilterKey;
        return filter && ['today', 'tomorrow', 'week', 'all'].includes(filter) ? filter : 'today';
    };

    // ĐỌC PAGE TỪ URL
    const getInitialPage = (): number => {
        const page = parseInt(searchParams.get('page') || '1');
        return isNaN(page) || page < 1 ? 1 : page;
    };

    // State cơ bản
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [checkingId, setCheckingId] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterKey>(getInitialFilter);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [page, setPage] = useState<number>(getInitialPage);
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


    const filterOptions: FilterOption[] = [
        { key: 'today', label: t('receptionist.filterToday'), icon: '📅' },
        { key: 'tomorrow', label: t('receptionist.filterTomorrow'), icon: '⏰' },
        { key: 'week', label: t('receptionist.filterWeek'), icon: '📆' },
        { key: 'all', label: t('receptionist.filterAll'), icon: '📋' },
    ];

    const statusOptions = [
        { value: 'all', label: t('receptionist.statusAll'), icon: '📋' },
        { value: 'waiting', label: t('receptionist.statusWaiting'), icon: '⏳' },
        { value: 'checkedIn', label: t('receptionist.statusCheckedIn'), icon: '✅' },
        { value: 'completed', label: t('receptionist.statusCompleted'), icon: '📋' },
        { value: 'cancelled', label: t('receptionist.cancelledStatus'), icon: '❌' },
    ];

    useEffect(() => {
        const currentFilter = searchParams.get('filter');
        const currentPage = searchParams.get('page');

        if (
            currentFilter !== activeFilter ||
            currentPage !== page.toString()
        ) {
            setSearchParams({
                filter: activeFilter,
                page: page.toString()
            });
        }
    }, [activeFilter, page]);

    useEffect(() => {
        const filter = searchParams.get('filter') as FilterKey;
        const pageParam = parseInt(searchParams.get('page') || '1');

        if (
            filter &&
            ['today', 'tomorrow', 'week', 'all'].includes(filter) &&
            filter !== activeFilter
        ) {
            setActiveFilter(filter);
        }

        if (!isNaN(pageParam) && pageParam >= 1 && pageParam !== page) {
            setPage(pageParam);
        }
    }, [searchParams]);

    // Lấy thống kê
    const fetchStatistics = async () => {
        setStatsLoading(true);

        try {
            const data = await receptionistApi.getDashboardStatistics(activeFilter);
            setStats(data);
        } catch {
            toast.error(t('receptionist.loadStatsError'));
        } finally {
            setStatsLoading(false);
        }
    };

    // Lấy thông tin bệnh viện
    useEffect(() => {
        const fetchHospitalInfo = async () => {
            try {
                const hospital = await receptionistApi.getCurrentHospital();
                setHospitalName(hospital.name);
            } catch (error) {
                console.error('Failed to fetch hospital info:', error);
            }
        };
        fetchHospitalInfo();
    }, []);

    // Lấy danh sách appointments
    const fetchAppointments = async (targetPage?: number) => {
        const newPage = targetPage ?? page; setLoading(true);
        try {
            const response: PageResponse<Appointment> = await receptionistApi.getAppointments(activeFilter, newPage - 1, PAGE_SIZE);
            setAppointments(response.content || []);
            setPage(newPage);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch {
            toast.error(t('receptionist.loadError'));
        } finally {
            setLoading(false);
        }
    };

    // Gọi khi đổi filter
    useEffect(() => {
        fetchStatistics();
        fetchAppointments(page);
    }, [activeFilter]);

    // Reset page khi đổi status filter
    useEffect(() => {
        setPage(1);
    }, [statusFilter]);

    const handleFilterChange = (filter: FilterKey) => {
        setActiveFilter(filter);
        setSearchTerm('');
        setStatusFilter('all');
        setPage(1);
    };

    // Xử lý check in
    const handleCheckIn = async (appointmentId: string) => {
        setCheckingId(appointmentId);
        try {
            await receptionistApi.checkIn(appointmentId);
            toast.success(t('receptionist.checkInSuccess'));
            fetchAppointments(page);
            fetchStatistics();
        } catch {
            toast.error(t('receptionist.checkInError'));
        } finally {
            setCheckingId(null);
        }
    };

    // Lọc theo status và search
    const getFilteredAppointments = () => {
        let result = [...appointments];

        if (statusFilter !== 'all') {
            const statusMap = {
                waiting: 'CONFIRMED',
                checkedIn: 'IN_PROGRESS',
                completed: 'COMPLETED',
                cancelled: 'CANCELLED',
            };
            const targetStatus = statusMap[statusFilter as keyof typeof statusMap];
            result = result.filter(a => a.status === targetStatus);
        }

        if (searchTerm) {
            result = result.filter(apt =>
                apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.phone?.includes(searchTerm)
            );
        }

        return result;
    };

    const handleCancelAppointment = async (data: { reason: string; refundMethod: RefundMethod; refundAmount?: number }) => {
        if (!cancelModal.appointmentId) return;

        setCancelling(true);
        try {
            await receptionistApi.cancelAppointment(cancelModal.appointmentId, {
                reason: data.reason,
                refundMethod: data.refundMethod,
                refundAmount: data.refundAmount
            });
            toast.success(t('receptionist.cancelSuccess'));
            fetchAppointments(page);
            fetchStatistics();
            setCancelModal({ ...cancelModal, open: false });
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('receptionist.cancelError'));
        } finally {
            setCancelling(false);
        }
    };

    // Hàm mở lại QR
    const handleOpenQR = async (appointmentId: string) => {
        try {
            const response = await receptionistApi.getPaymentQR(appointmentId);
            setQrModal({
                open: true,
                payUrl: response.payUrl,
                qrCodeUrl: response.qrCodeUrl
            });
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('receptionist.openQRError'));
        }
    };

    const filteredAppointments = getFilteredAppointments();
    const filteredTotalPages = totalPages;
    const filteredTotal = statusFilter === 'all' ? totalElements : filteredAppointments.length;

    const renderPaginationInfo = () => {
        if (filteredTotal === 0) return null;
        const start = (page - 1) * PAGE_SIZE + 1;
        const end = Math.min(page * PAGE_SIZE, filteredTotal);
        return (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                {t('receptionist.showing')} {start} - {end} {t('receptionist.of')} {filteredTotal} {t('receptionist.appointments')}
            </div>
        );
    };

    // Kiểm tra xem có thể check-in không
    const canCheckIn = (appointment: Appointment): boolean => {
        // Chỉ check-in được khi status là CONFIRMED
        if (appointment.status !== 'CONFIRMED') return false;

        // Lấy ngày của appointment (từ startTime)
        const appointmentDate = new Date(
            appointment.startTime[0],  // year
            appointment.startTime[1] - 1, // month (0-indexed)
            appointment.startTime[2]  // day
        );

        // Lấy ngày hôm nay
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Chỉ check-in được nếu là ngày hôm nay
        return appointmentDate.getTime() === today.getTime();
    };

    useEffect(() => {
        console.log('=== DEBUG ===');
        console.log('activeFilter:', activeFilter);
        console.log('statusFilter:', statusFilter);
        console.log('searchTerm:', searchTerm);
        console.log('appointments length:', appointments.length);
        console.log('filteredAppointments length:', filteredAppointments.length);
    }, [activeFilter, statusFilter, searchTerm, appointments, filteredAppointments]);


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex justify-between items-start sm:items-center">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-white">👩‍⚕️ {t('receptionist.title')}</h1>
                            <p className="text-blue-100 text-xs sm:text-sm mt-0.5 sm:mt-1">{t('receptionist.subtitle')}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 py-1 sm:px-4 sm:py-2">
                            <div className="flex items-center gap-1 sm:gap-2">
                                <span className="text-base sm:text-lg">🏥</span>
                                <div className="hidden xs:block">
                                    <p className="text-[10px] sm:text-xs text-blue-100">{t('receptionist.currentHospital')}</p>
                                    <p className="text-xs sm:text-sm font-semibold text-white line-clamp-1 max-w-[120px] sm:max-w-[200px]">{hospitalName}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs + Create Button */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl shadow-sm p-2 mb-6">
                    <div className="flex items-center gap-2">
                        {/* Filter Tabs - Scroll ngang */}
                        <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide py-1 pl-1">
                            <FilterTabs
                                options={filterOptions}
                                activeKey={activeFilter}
                                onSelect={(key) => handleFilterChange(key as FilterKey)}
                                variant="default"
                                size="sm"
                                className="min-w-max"
                            />
                        </div>

                        {/* Create Button */}
                        <Button
                            variant="outline"
                            onClick={() => setShowCreateModal(true)}
                            size="sm"
                            rounded="lg"
                            className="flex-shrink-0 ml-1 mr-1"
                        >
                            📝 <span className="hidden xs:inline">{t('receptionist.createNew')}</span>
                            <span className="xs:hidden">📝</span>
                        </Button>
                    </div>
                </div>

                <CreateOfflineAppointmentModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        fetchAppointments(page);
                        fetchStatistics();
                    }}
                />

                {/* Stats Cards */}
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6">
                    {activeFilter !== 'tomorrow' && activeFilter !== 'all' && (
                        <>
                            <StatCard value={stats.waiting} label={t('receptionist.waiting')} color="yellow" loading={statsLoading} />
                            <StatCard value={stats.checkedIn} label={t('receptionist.checkedIn')} color="green" loading={statsLoading} />
                            <StatCard value={stats.completed} label={t('receptionist.completed')} color="blue" loading={statsLoading} />
                            <StatCard value={stats.cancelled} label={t('receptionist.cancelled')} color="red" loading={statsLoading} />
                            <StatCard value={stats.noShow} label={t('receptionist.noShow')} color="gray" loading={statsLoading} />
                        </>
                    )}

                    {activeFilter === 'tomorrow' && (
                        <>
                            <StatCard value={stats.waiting} label={t('receptionist.expected')} color="yellow" loading={statsLoading} />
                            <StatCard value={stats.cancelled} label={t('receptionist.cancelled')} color="red" loading={statsLoading} />
                        </>
                    )}

                    {activeFilter === 'all' && (
                        <>
                            <StatCard value={stats.total} label={t('receptionist.total')} color="blue" loading={statsLoading} />
                            <StatCard value={stats.upcoming} label={t('receptionist.upcoming')} color="purple" loading={statsLoading} />
                            <StatCard value={stats.completed} label={t('receptionist.completed')} color="green" loading={statsLoading} />
                            <StatCard value={stats.cancelled} label={t('receptionist.cancelled')} color="red" loading={statsLoading} />
                            <StatCard value={stats.noShow} label={t('receptionist.noShow')} color="gray" loading={statsLoading} />
                        </>
                    )}
                </div>

                {/* Search + Status Filter */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder={t('receptionist.searchPlaceholder')}
                                className="w-full p-2 sm:p-3 text-sm border rounded-lg"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="sm:w-48">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white bg-white dark:bg-gray-800 cursor-pointer"
                            >
                                {statusOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.icon} {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Appointments List */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-900 dark:text-white flex justify-between items-center">
                        <span>{t('receptionist.appointments')} ({filteredTotal})</span>
                        {statusFilter !== 'all' && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setStatusFilter('all');
                                    setPage(0);
                                }}
                            >
                                ✖ {t('common.clearFilter')}
                            </Button>
                        )}
                    </div>

                    <div className="relative">
                        {loading ? (
                            <div className="py-12 flex justify-center">
                                <LoadingSpinner size="lg" />
                            </div>
                        ) : filteredAppointments.length === 0 ? (
                            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                                📭 {t('receptionist.noAppointments')}
                            </div>
                        ) : (
                            <>
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredAppointments.map((apt) => (
                                        <div key={apt.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-base font-semibold text-gray-900 dark:text-white">
                                                        {apt.patientName}
                                                    </span>
                                                    <StatusBadge
                                                        status={apt.status}
                                                        size="sm"
                                                        showIcon={true}
                                                    />
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-primary">{formatPrice(apt.price)}</p>
                                                    <p className="text-xs text-gray-500">{apt.paid ? t('receptionist.paid') : t('receptionist.unpaid')}</p>
                                                </div>
                                            </div>

                                            {/* Info Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                        <span>🕐</span>
                                                        <span>{t('receptionist.appointmentTime')}: {formatDateTime(apt.startTime, 'HH:MM')}</span>
                                                        <span className="text-xs text-gray-400">({formatDateTime(apt.startTime, 'dd/MM/yyyy')})</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                        <span>👨‍⚕️</span>
                                                        <span>{t('receptionist.doctor')}: {apt.doctorName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                        <span>🏥</span>
                                                        <span>{t('receptionist.hospital')}: {apt.hospitalName}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                        <span>📞</span>
                                                        <span>{t('receptionist.phone')}: {apt.phone || t('common.noPhone')}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                        <span>🚪</span>
                                                        <span>{t('receptionist.room')}: {apt.roomNumber || t('common.notAssigned')}</span>
                                                        {apt.roomFloor && <span className="text-xs">({t('receptionist.floor')} {apt.roomFloor})</span>}
                                                    </div>
                                                    {apt.symptoms && (
                                                        <div className="flex items-start gap-2 text-gray-500 dark:text-gray-500">
                                                            <span>💬</span>
                                                            <span className="text-xs italic">"{apt.symptoms.substring(0, 50)}"</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Check-in Time */}
                                            {apt.status === 'IN_PROGRESS' && apt.checkInTime && (
                                                <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                                        ✅ {t('receptionist.checkInTime')}: {formatDateTime(apt.checkInTime, 'HH:MM')}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="mt-4 flex flex-wrap justify-end gap-2">
                                                {/* Nút mở lại QR - cho appointment AWAITING_PAYMENT */}
                                                {apt.status === 'AWAITING_PAYMENT' && (
                                                    <Button size="sm" variant="outline" onClick={() => handleOpenQR(apt.id)}>
                                                        🟣 {t('receptionist.openQR')}
                                                    </Button>
                                                )}

                                                {/* Nút hủy lịch - cho appointment chưa bị hủy */}
                                                {apt.status !== 'CANCELLED' && (
                                                    <Button
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
                                                )}

                                                {/* Nút check-in */}
                                                {apt.status === 'CONFIRMED' && canCheckIn(apt) && (
                                                    <Button
                                                        size="sm"
                                                        variant="primary"
                                                        onClick={() => handleCheckIn(apt.id)}
                                                        loading={checkingId === apt.id}
                                                    >
                                                        ✅ {t('receptionist.checkIn')}
                                                    </Button>
                                                )}
                                                {apt.status === 'CONFIRMED' && !canCheckIn(apt) && (
                                                    <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-lg text-sm">
                                                        📅 {t('receptionist.waitForExamDate')}
                                                    </span>
                                                )}
                                                {apt.status === 'IN_PROGRESS' && (
                                                    <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm flex items-center gap-1">
                                                        ✅ {t('receptionist.checkedInStatus')}
                                                    </span>
                                                )}
                                                {apt.status === 'COMPLETED' && (
                                                    <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm flex items-center gap-1">
                                                        📋 {t('receptionist.completedStatus')}
                                                    </span>
                                                )}
                                                {apt.status === 'CANCELLED' && (
                                                    <span className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-center gap-1">
                                                        ❌ {t('receptionist.cancelledStatus')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Pagination */}
                        {filteredTotalPages > 1 && (
                            <>
                                {renderPaginationInfo()}
                                <Pagination
                                    currentPage={page}
                                    totalPages={filteredTotalPages}
                                    onPageChange={(newPage) => {
                                        setPage(newPage);
                                        fetchAppointments(newPage);
                                    }}
                                />
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

                {/* QR Modal - Mở lại thanh toán */}
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