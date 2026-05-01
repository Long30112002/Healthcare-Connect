import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { useTabWithUrl } from '../../../application/hooks/useTabWithUrl';
import { appointmentApi } from '../../../infrastructure/api/appointmentApi';
import toast from 'react-hot-toast';
import type { Appointment } from '../../../core/types';
import type { DoctorRespone, PageResponse } from '../../../core/types/api.response';
import { DashboardHeader, DashboardStats, DashboardSearch, AppointmentCard } from '../../components/medical-dashboard';
import FilterTabs from '../../../presentation/components/shared/FilterTabs';
import Pagination from '../../../presentation/components/shared/Pagination';
import Button from '../../../presentation/components/shared/Button';
import LoadingSpinner from '../../../presentation/components/shared/LoadingSpinner';
import EmptyState from '../../../presentation/components/shared/EmptyState';
import useFetch from '../../../application/hooks/useFetch';
import { doctorApi } from '../../../infrastructure/api/doctorApi';

type TabKey = 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const { t } = useAppTranslation();
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [doctorInfo, setDoctorInfo] = useState<DoctorRespone | null>(null);
    const [loadingInfo, setLoadingInfo] = useState(true);

    const { activeTab, setActiveTab, page, setPage, apiPage } = useTabWithUrl({
        paramName: 'tab',
        validValues: ['confirmed', 'in_progress', 'completed', 'cancelled'],
        defaultValue: 'confirmed'
    });

    const statusMap: Record<TabKey, string | undefined> = {
        confirmed: 'CONFIRMED',
        in_progress: 'IN_PROGRESS',
        completed: 'COMPLETED',
        cancelled: 'CANCELLED',
    };

    const url = `/doctor/appointments?page=${apiPage}&size=10${statusMap[activeTab] ? `&status=${statusMap[activeTab]}` : ''}`;

    const { data, loading, error, refetch } = useFetch<PageResponse<Appointment>>(
        url,
        'GET',
        {
            immediate: true,
            deps: [apiPage, activeTab]
        }
    );

    useEffect(() => {

        const fetchDoctorInfo = async () => {
            try {
                const info = await doctorApi.getMyInfo();
                setDoctorInfo(info);
            } catch (error) {
                console.error('Failed to fetch doctor info:', error);
            } finally {
                setLoadingInfo(false);
            }
        };
        fetchDoctorInfo();
    }, []);

    const appointments = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;

    const stats = [
        { value: appointments.length, label: t('doctor.stats.total'), color: 'blue' as const },
        { value: appointments.filter(a => a.status === 'COMPLETED').length, label: t('doctor.stats.completed'), color: 'green' as const },
        { value: appointments.filter(a => a.status === 'IN_PROGRESS').length, label: t('doctor.stats.inProgress'), color: 'yellow' as const },
    ];

    const tabOptions = [
        { key: 'confirmed' as TabKey, label: t('doctor.tabConfirmed'), icon: '✅' },
        { key: 'in_progress' as TabKey, label: t('doctor.tabInProgress'), icon: '🩺' },
        { key: 'completed' as TabKey, label: t('doctor.tabCompleted'), icon: '🎉' },
        { key: 'cancelled' as TabKey, label: t('doctor.tabCancelled'), icon: '❌' },
    ];

    // Filter appointments theo search term
    const filteredAppointments = appointments.filter(apt =>
        apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patientPhone?.includes(searchTerm)
    );

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

    const handleCompleteExam = async (appointmentId: string) => {
        setUpdatingId(appointmentId);
        try {
            await appointmentApi.completeExam(appointmentId);
            toast.success(t('doctor.completeExamSuccess'));
            navigate(`/doctor/medical-records/create/${appointmentId}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('doctor.completeExamFailed'));
        } finally {
            setUpdatingId(null);
        }
    };

    const handleTabChange = (tabKey: TabKey) => {
        setActiveTab(tabKey);
        setSearchTerm('');
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    if (loading && page === 0) {
        return <LoadingSpinner fullScreen size="lg" />;
    }

    const renderActions = (apt: Appointment) => {
        const actions = [];


        if (apt.status === 'IN_PROGRESS') {
            actions.push(
                <Button key="complete" size="sm" variant="primary" onClick={() => handleCompleteExam(apt.id)} loading={updatingId === apt.id}>
                    🩺 {t('doctor.completeExam')}
                </Button>
            );
        }

        if (apt.status === 'COMPLETED') {
            if (!apt.hasMedicalRecord) {
                actions.push(
                    <Button key="create" size="sm" variant="primary" onClick={() => navigate(`/doctor/medical-records/create/${apt.id}`)}>
                        📝 {t('doctor.createMedicalRecord')}
                    </Button>
                );
            } else {
                actions.push(
                    <Button key="view" size="sm" variant="primary" onClick={() => navigate(`/doctor/medical-records/view/${apt.id}`)}>
                        📄 {t('doctor.viewMedicalRecord')}
                    </Button>
                );
            }
        }

        return (
            <div className="flex justify-end gap-2">
                {actions}
            </div>
        );
    };

    const renderWarning = (apt: Appointment) => {
        if (apt.status === 'COMPLETED' && !apt.hasMedicalRecord) {
            return (
                <div className="flex items-center gap-1 px-2 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                    <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                        {t('doctor.noMedicalRecordYet')}
                    </span>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <DashboardHeader
                    icon="👨‍⚕️"
                    title={t('doctor.dashboardTitle')}
                    subtitle={t('doctor.dashboardSubtitle')}
                    showHospital={true}
                    hospitalName={doctorInfo?.hospitalName || ''}
                />

                {/* Tabs */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl shadow-sm mb-6">
                    <div className="p-2">
                        <div className="flex items-center gap-2">
                            {/* Filter Tabs - scroll ngang */}
                            <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide py-1">
                                <FilterTabs
                                    options={tabOptions}
                                    activeKey={activeTab}
                                    onSelect={(key) => handleTabChange(key as TabKey)}
                                    variant="default"
                                    size="md"
                                    className="min-w-max"
                                />
                            </div>

                            <Button
                                variant="primary"
                                onClick={() => navigate('/doctor/schedules/create')}
                                size="sm"
                                className="flex-shrink-0"
                            >
                                📅 <span className="hidden xs:inline">{t('doctor.createSchedule')}</span>
                                <span className="xs:hidden">📅</span>
                            </Button>
                        </div>
                    </div>
                </div>


                {/* Stats Cards */}
                <DashboardStats stats={stats} />

                {/* Search */}
                <DashboardSearch
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    searchPlaceholder={t('doctor.searchPlaceholder')}
                />

                {/* Appointments List */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-900 dark:text-white">
                        {t('receptionist.appointments')} ({filteredAppointments.length})
                    </div>

                    <div className="p-4">
                        {error && (
                            <div className="text-center py-8">
                                <p className="text-red-500 dark:text-red-400">{error}</p>
                                <button onClick={() => refetch()} className="mt-2 text-primary hover:underline">
                                    {t('common.retry')}
                                </button>
                            </div>
                        )}

                        {!error && filteredAppointments.length === 0 && (
                            <EmptyState
                                title={t('doctor.noAppointments')}
                                description={t('doctor.noAppointmentsDesc')}
                                icon="📋"
                            />
                        )}

                        {filteredAppointments.length > 0 && (
                            <div className="space-y-3">
                                {filteredAppointments.map((apt) => (
                                    <AppointmentCard
                                        key={apt.id}
                                        appointment={apt}
                                        warning={renderWarning(apt)}
                                        actions={renderActions(apt)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-6">
                                <Pagination
                                    currentPage={page + 1}
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;