import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { useMinLoadingAction } from '../../../application/hooks/useMinLoadingAction';
import Button from '../../../presentation/components/shared/Button';
import EmptyState from '../../../presentation/components/shared/EmptyState';
import Pagination from '../../../presentation/components/shared/Pagination';
import Modal from '../../../presentation/components/shared/Modal';
import FilterTabs from '../../../presentation/components/shared/FilterTabs';
import StatusBadge from '../../../presentation/components/shared/StatusBadge';
import { DashboardHeader, DashboardStats } from '../../components/medical-dashboard';
import { doctorApi } from '../../../infrastructure/api/doctorApi';
import { formatDateShort, formatTimeOnly, formatPrice } from '../../../shared/utils/dateUtils';
import useFetch from '../../../application/hooks/useFetch';
import type { PageResponse } from '../../../core/types/api.response';
import React from 'react';

interface ScheduleRespone {
    id: string;
    doctorId: string;
    doctorName: string;
    date: number[];
    startTime: number[];
    endTime: number[];
    maxPatients: number;
    currentBookings: number;
    status: 'AVAILABLE' | 'FULL' | 'CANCELLED' | 'EXPIRED';
    price: number;
    roomId?: string;
    roomNumber?: string;
    roomFloor?: number;
}

const MySchedulePage = () => {
    const navigate = useNavigate();
    const { t } = useAppTranslation();

    const [activeTab, setActiveTab] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const apiPage = currentPage - 1;

    const updateUrl = (tab: string, pageNum: number) => {
        const newUrl = `${window.location.pathname}?status=${tab}&page=${pageNum}`;
        window.history.replaceState(null, '', newUrl);
    };

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('status');
        const pageParam = parseInt(params.get('page') || '1');

        if (tabParam && ['all', 'available', 'full', 'cancelled', 'expired'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
        if (!isNaN(pageParam) && pageParam >= 1) {
            setCurrentPage(pageParam);
        }
    }, []);

    const [deleteId, setDeleteId] = useState<string | null>(null);

    const url = `/doctor/schedules?page=${apiPage}&size=10`;

    const { data, loading, error, refetch } = useFetch<PageResponse<ScheduleRespone>>(
        url,
        'GET',
        {
            immediate: true,
            deps: [apiPage]
        }
    );

    const schedules = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;

    const filteredSchedules = useMemo(() => {
        if (activeTab === 'all') return schedules;

        const statusMap: Record<string, string> = {
            available: 'AVAILABLE',
            full: 'FULL',
            cancelled: 'CANCELLED',
            expired: 'EXPIRED'
        };
        const targetStatus = statusMap[activeTab];
        return schedules.filter(s => s.status === targetStatus);
    }, [schedules, activeTab]);

    // Stats data cho DashboardStats - loading: false để không bị loading
    const stats = [
        { value: schedules.filter(s => s.status === 'AVAILABLE').length, label: t('schedule.available'), color: 'green' as const, loading: false },
        { value: schedules.filter(s => s.status === 'FULL').length, label: t('schedule.full'), color: 'red' as const, loading: false },
        { value: schedules.filter(s => s.status === 'CANCELLED').length, label: t('schedule.cancelled'), color: 'gray' as const, loading: false },
        { value: schedules.filter(s => s.status === 'EXPIRED').length, label: t('schedule.expired'), color: 'gray' as const, loading: false },
    ];

    const filterOptions = [
        { key: 'all', label: t('mySchedule.filterAll'), icon: '📋' },
        { key: 'available', label: t('schedule.available'), icon: '🟢' },
        { key: 'full', label: t('schedule.full'), icon: '🔴' },
        { key: 'cancelled', label: t('schedule.cancelled'), icon: '❌' },
        { key: 'expired', label: t('schedule.expired'), icon: '⏰' },
    ];

    const { execute: deleteSchedule, loading: deleting } = useMinLoadingAction({
        minLoadingTime: 500,
        successMessage: t('schedule.deleteSuccess'),
        errorMessage: (error) => error.response?.data?.message || t('schedule.deleteError'),
        onSuccess: () => {
            setDeleteId(null);
            refetch();
        }
    });

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            await deleteSchedule(() => doctorApi.deleteSchedule(deleteId));
        }
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setCurrentPage(1);
        updateUrl(tab, 1);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        updateUrl(activeTab, newPage);
    };

    const getScheduleType = (schedule: ScheduleRespone) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const scheduleDate = new Date(schedule.date[0], schedule.date[1] - 1, schedule.date[2]);

        if (scheduleDate < today) return 'past';
        if (scheduleDate.getTime() === today.getTime()) return 'today';
        return 'future';
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'AVAILABLE':
                return <StatusBadge status="AVAILABLE" size="sm" />;
            case 'FULL':
                return <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    🔴 {t('schedule.full')}
                </span>;
            case 'CANCELLED':
                return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    ❌ {t('schedule.cancelled')}
                </span>;
            case 'EXPIRED':
                return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    ⏰ {t('schedule.expired')}
                </span>;
            default:
                return null;
        }
    };

    const isModifiable = (schedule: ScheduleRespone): boolean => {
        if (schedule.status === 'CANCELLED' || schedule.status === 'EXPIRED') return false;
        if (schedule.currentBookings > 0) return false;

        const scheduleDate = new Date(schedule.date[0], schedule.date[1] - 1, schedule.date[2]);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return scheduleDate > today;
    };

    const canEdit = isModifiable;
    const canDelete = isModifiable;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-6">
                <DashboardHeader
                    icon="📅"
                    title={t('mySchedule.title')}
                    subtitle={t('mySchedule.subtitle')}
                    showCreateButton={true}
                    onCreateClick={() => navigate('/doctor/schedules/create')}
                    createButtonText={t('mySchedule.createNew')}
                />

                {/* Filter Tabs */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl shadow-sm mb-6">
                    <div className="p-2">
                        <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide py-1">
                                <FilterTabs
                                    options={filterOptions}
                                    activeKey={activeTab}
                                    onSelect={handleTabChange}
                                    variant="default"
                                    size="md"
                                    className="min-w-max"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards - Luôn hiển thị, không loading */}
                <DashboardStats stats={stats} />

                {/* Schedule List - Chỉ loading phần này */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-900 dark:text-white">
                        {t('mySchedule.scheduleList')} ({filteredSchedules.length})
                    </div>

                    <div className="p-4">
                        {/* Chỉ loading ở đây */}
                        {loading ? (
                            <div className="py-12 flex justify-center">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-gray-500">{t('common.loading')}</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8">
                                <p className="text-red-500 dark:text-red-400">{error}</p>
                                <button onClick={() => refetch()} className="mt-2 text-primary hover:underline">
                                    {t('common.retry')}
                                </button>
                            </div>
                        ) : filteredSchedules.length === 0 ? (
                            <EmptyState
                                title={t('mySchedule.noSchedules')}
                                description={t('mySchedule.noSchedulesDesc')}
                                icon="📅"
                                actionText={t('mySchedule.createFirst')}
                                onAction={() => navigate('/doctor/schedules/create')}
                            />
                        ) : (
                            <>
                                <div className="space-y-3">
                                    {filteredSchedules.map((schedule) => (
                                        <div key={schedule.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white">
                                                        📅 {formatDateShort(schedule.date)}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        ⏰ {formatTimeOnly(schedule.startTime)} - {formatTimeOnly(schedule.endTime)}
                                                    </p>
                                                </div>
                                                {getStatusBadge(schedule.status)}
                                            </div>

                                            {/* Info Grid */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 text-sm">
                                                <div>
                                                    <p className="text-xs text-gray-500">{t('mySchedule.price')}</p>
                                                    <p className="font-medium text-green-600 dark:text-green-400">
                                                        {formatPrice(schedule.price)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">{t('mySchedule.patients')}</p>
                                                    <p className="font-medium">
                                                        {schedule.currentBookings} / {schedule.maxPatients}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">{t('mySchedule.room')}</p>
                                                    <p className="font-medium">
                                                        {schedule.roomNumber || t('mySchedule.notAssigned')}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">{t('mySchedule.status')}</p>
                                                    <p className="font-medium">
                                                        {schedule.status === 'AVAILABLE' && t('schedule.available')}
                                                        {schedule.status === 'FULL' && t('schedule.full')}
                                                        {schedule.status === 'CANCELLED' && t('schedule.cancelled')}
                                                        {schedule.status === 'EXPIRED' && t('schedule.expired')}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex justify-between items-center mt-3">
                                                <div>
                                                    {schedule.currentBookings > 0 && getScheduleType(schedule) === 'future' && (
                                                        <div className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
                                                            ⚠️ {t('mySchedule.warningHasBookings', { count: schedule.currentBookings })}
                                                        </div>
                                                    )}
                                                    {getScheduleType(schedule) === 'today' && (
                                                        <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-lg">
                                                            ⏰ {t('mySchedule.warningToday')}
                                                        </div>
                                                    )}
                                                    {getScheduleType(schedule) === 'past' && (
                                                        <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
                                                            📅 {t('mySchedule.warningPast')}
                                                        </div>
                                                    )}
                                                    {schedule.status === 'CANCELLED' && (
                                                        <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
                                                            ❌ {t('mySchedule.warningCancelled')}
                                                        </div>
                                                    )}
                                                    {schedule.status === 'EXPIRED' && (
                                                        <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
                                                            ⏰ {t('mySchedule.warningExpired')}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => navigate(`/doctor/schedules/${schedule.id}/detail`)}>
                                                        🔍 {t('common.viewDetail')}
                                                    </Button>
                                                    {canEdit(schedule) && (
                                                        <Button size="sm" variant="outline" onClick={() => navigate(`/doctor/schedules/${schedule.id}/edit`)}>
                                                            ✏️ {t('common.edit')}
                                                        </Button>
                                                    )}
                                                    {canDelete(schedule) && (
                                                        <Button size="sm" variant="danger" onClick={() => handleDelete(schedule.id)}>
                                                            🗑️ {t('common.delete')}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-6">
                                        <Pagination
                                            currentPage={currentPage}
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

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={!!deleteId}
                    onClose={() => setDeleteId(null)}
                    onConfirm={confirmDelete}
                    title={t('schedule.deleteTitle')}
                    message={t('schedule.deleteConfirm')}
                    variant="danger"
                    confirmText={t('common.delete')}
                    cancelText={t('common.cancel')}
                    loading={deleting}
                />
            </div>
        </div>
    );
};

export default MySchedulePage;