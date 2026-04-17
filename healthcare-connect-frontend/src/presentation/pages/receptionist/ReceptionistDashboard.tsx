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

type FilterKey = 'today' | 'tomorrow' | 'week' | 'all';
type StatusFilter = 'all' | 'waiting' | 'checkedIn' | 'completed';

const PAGE_SIZE = 5;

const ReceptionistDashboard = () => {
    const { t } = useAppTranslation();

    // State cơ bản
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [checkingId, setCheckingId] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterKey>('today');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [jumpToPage, setJumpToPage] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);


    // State thống kê
    const [stats, setStats] = useState<DashboardStatistics>({ waiting: 0, checkedIn: 0, completed: 0, total: 0 });
    const [statsLoading, setStatsLoading] = useState(true);

    const filters = [
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
    ];

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

    // Lấy danh sách appointments
    const fetchAppointments = async (targetPage?: number) => {
        const newPage = targetPage !== undefined ? targetPage : page;
        setLoading(true);

        try {
            const response: PageResponse<Appointment> = await receptionistApi.getAppointments(activeFilter, newPage, PAGE_SIZE);
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
        fetchAppointments(0);
    }, [activeFilter]);

    // Reset page khi đổi status filter
    useEffect(() => {
        setPage(0);
    }, [statusFilter]);

    const handleFilterChange = (filter: FilterKey) => {
        setActiveFilter(filter);
        setSearchTerm('');
        setStatusFilter('all');
        setPage(0);
    };

    // Hàm xử lý check in
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

    // Hàm xử lý nhảy trang
    const handleJumpToPage = () => {
        const pageNum = parseInt(jumpToPage);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= filteredTotalPages) {
            const newPage = pageNum - 1;
            setPage(newPage);
            fetchAppointments(newPage);
            setJumpToPage('');
        }
    };

    // Hàm xử lý Enter key
    const handleJumpKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleJumpToPage();
        }
    };

    const filteredAppointments = getFilteredAppointments();
    const filteredTotalPages = statusFilter === 'all' ? totalPages : Math.ceil(filteredAppointments.length / PAGE_SIZE);
    const filteredTotal = statusFilter === 'all' ? totalElements : filteredAppointments.length;

    const getStatusBadge = (status: string) => {
        const map: Record<string, string> = {
            'CONFIRMED': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            'IN_PROGRESS': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'COMPLETED': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'CANCELLED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };
        return map[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    };

    const goToPreviousPage = () => {
        if (page > 0) {
            fetchAppointments(page - 1);
        }
    };

    const goToNextPage = () => {
        if (page + 1 < totalPages) {
            fetchAppointments(page + 1);
        }
    };

    const renderPaginationInfo = () => {
        if (filteredTotal === 0) return null;
        const start = page * PAGE_SIZE + 1;
        const end = Math.min((page + 1) * PAGE_SIZE, filteredTotal);
        return (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                {t('receptionist.showing')} {start} - {end} {t('receptionist.of')} {filteredTotal} {t('receptionist.appointments')}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 mb-6">
                    <h1 className="text-2xl font-bold text-white">👩‍⚕️ {t('receptionist.title')}</h1>
                    <p className="text-blue-100 mt-1">{t('receptionist.subtitle')}</p>
                </div>

                {/* Filter Tabs + Create Button */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl shadow-sm p-2 mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        {/* Các nút filter bên trái */}
                        <div className="flex flex-wrap gap-2">
                            {filters.map((filter) => (
                                <Button
                                    key={filter.key}
                                    onClick={() => handleFilterChange(filter.key as FilterKey)}
                                    variant={activeFilter === filter.key ? 'primary' : 'outline'}
                                    rounded="lg"
                                    size="sm"
                                >
                                    {filter.icon} {filter.label}
                                </Button>
                            ))}
                        </div>

                        {/* Nút tạo lịch mới bên phải */}
                        <Button
                            variant="outline"
                            onClick={() => setShowCreateModal(true)}
                            size="sm"
                            rounded="lg"
                        >
                            📝 {t('receptionist.createNew')}
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
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm">
                        {statsLoading ? (
                            <div className="text-2xl font-bold animate-pulse">...</div>
                        ) : (
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.waiting}</div>
                        )}
                        <div className="text-sm text-gray-500 dark:text-gray-400">{t('receptionist.waiting')}</div>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm">
                        {statsLoading ? (
                            <div className="text-2xl font-bold animate-pulse">...</div>
                        ) : (
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.checkedIn}</div>
                        )}
                        <div className="text-sm text-gray-500 dark:text-gray-400">{t('receptionist.checkedIn')}</div>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm">
                        {statsLoading ? (
                            <div className="text-2xl font-bold animate-pulse">...</div>
                        ) : (
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.completed}</div>
                        )}
                        <div className="text-sm text-gray-500 dark:text-gray-400">{t('receptionist.completed')}</div>
                    </div>
                </div>

                {/* Search + Status Filter */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 shadow-sm mb-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder={t('receptionist.searchPlaceholder')}
                                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white"
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
                        {/* Overlay loading */}
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
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(apt.status)}`}>
                                                        {apt.status === 'CONFIRMED' && t('receptionist.waitingCheckin')}
                                                        {apt.status === 'IN_PROGRESS' && t('receptionist.checkedInStatus')}
                                                        {apt.status === 'COMPLETED' && t('receptionist.completedStatus')}
                                                    </span>
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

                                            {/* Action */}
                                            <div className="mt-4 flex justify-end">
                                                {apt.status === 'CONFIRMED' && (
                                                    <Button
                                                        size="sm"
                                                        variant="primary"
                                                        onClick={() => handleCheckIn(apt.id)}
                                                        loading={checkingId === apt.id}
                                                    >
                                                        ✅ {t('receptionist.checkIn')}
                                                    </Button>
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
                                <div className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                        {/* Nút điều hướng */}
                                        <div className="flex items-center gap-1">
                                            {/* First page */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setPage(0);
                                                    fetchAppointments(0);
                                                }}
                                                disabled={page === 0}
                                                className="px-2"
                                                title={t('pagination.firstPage')}
                                            >
                                                ⏮
                                            </Button>

                                            {/* Previous */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={goToPreviousPage}
                                                disabled={page === 0}
                                                title={t('pagination.previousPage')}
                                            >
                                                ← {t('common.previous')}
                                            </Button>

                                            {/* Current page indicator */}
                                            <span className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-md font-medium mx-1">
                                                {page + 1}
                                            </span>

                                            {/* Next */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={goToNextPage}
                                                disabled={page + 1 >= filteredTotalPages}
                                                title={t('pagination.nextPage')}
                                            >
                                                {t('common.next')} →
                                            </Button>

                                            {/* Last page */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const lastPage = filteredTotalPages - 1;
                                                    setPage(lastPage);
                                                    fetchAppointments(lastPage);
                                                }}
                                                disabled={page + 1 >= filteredTotalPages}
                                                className="px-2"
                                                title={t('pagination.lastPage')}
                                            >
                                                ⏭
                                            </Button>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {/* Divider */}
                                            <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">|</span>

                                            {/* Jump to page */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {t('pagination.goToPage')}
                                                </span>
                                                <input
                                                    type="number"
                                                    value={jumpToPage}
                                                    onChange={(e) => setJumpToPage(e.target.value)}
                                                    onKeyPress={handleJumpKeyPress}
                                                    min={1}
                                                    max={filteredTotalPages}
                                                    className="w-16 px-2 py-1 text-center text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                                                    placeholder={t('pagination.pagePlaceholder')}
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleJumpToPage}
                                                    className="px-2"
                                                    title={t('pagination.jumpToPage')}
                                                >
                                                    GO
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ReceptionistDashboard;