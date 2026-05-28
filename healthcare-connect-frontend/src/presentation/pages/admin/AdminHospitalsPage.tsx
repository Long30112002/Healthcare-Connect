import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { adminApi } from '../../../infrastructure/api/adminApi';
import type { AdminHospitalListResponse } from '../../../core/types/api.response';
import DashboardHeader from '../../components/medical-dashboard/DashboardHeader';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Pagination from '../../components/shared/Pagination';
import CreateHospitalModal from './components/CreateHospitalModal';
import DeleteHospitalModal from './components/DeleteHospitalModal';
import toast from 'react-hot-toast';
import { formatDateTime } from '../../../shared/utils/dateUtils';
import { HospitalStatus } from '../../../core/constants/enums';

const getStatusBadge = (status: string, t: (key: string) => string) => {
    switch (status) {
        case HospitalStatus.ACTIVE:
            return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">✅ {t('admin.hospitals.statusActive')}</span>;
        case HospitalStatus.PENDING_CONFIRMATION:
            return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">⏳ {t('admin.hospitals.statusPending')}</span>;
        case HospitalStatus.REJECTED:
            return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">❌ {t('admin.hospitals.statusRejected')}</span>;
        case HospitalStatus.EXPIRED:
            return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">⏰ {t('admin.hospitals.statusExpired')}</span>;
        default:
            return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{status}</span>;
    }
};

const AdminHospitalsPage = () => {
    const { t } = useAppTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy params từ URL
    const searchParams = new URLSearchParams(location.search);
    const urlPage = parseInt(searchParams.get('page') || '1');
    const urlKeyword = searchParams.get('keyword') || '';

    // States
    const [hospitals, setHospitals] = useState<AdminHospitalListResponse[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(urlPage);
    const [pageSize] = useState(10);
    const [searchKeyword, setSearchKeyword] = useState(urlKeyword);
    const [searchInput, setSearchInput] = useState(urlKeyword);

    // Table loading state
    const [tableLoading, setTableLoading] = useState(true);
    const [tableError, setTableError] = useState<string | null>(null);

    // Modal states
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{
        open: boolean;
        hospitalId: string | null;
        hospitalName: string;
    }>({
        open: false,
        hospitalId: null,
        hospitalName: '',
    });

    // Loading states for actions
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [resendingId, setResendingId] = useState<string | null>(null);

    // Cập nhật URL
    const updateUrl = useCallback((page: number, keyword: string) => {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        if (keyword) params.set('keyword', keyword);
        navigate(`/admin/hospitals?${params.toString()}`, { replace: true });
    }, [navigate]);

    // Fetch hospitals
    const fetchHospitals = useCallback(async () => {
        setTableLoading(true);
        setTableError(null);
        try {
            const response = await adminApi.getHospitals(
                currentPage - 1,
                pageSize,
                searchKeyword,
                'createdAt',
                'desc'
            );
            setHospitals(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (error) {
            console.error('Failed to fetch hospitals:', error);
            setTableError(t('common.loadError'));
        } finally {
            setTableLoading(false);
        }
    }, [currentPage, pageSize, searchKeyword, t]);

    useEffect(() => {
        fetchHospitals();
    }, [fetchHospitals]);

    // Handlers
    const handleSearch = () => {
        setCurrentPage(1);
        setSearchKeyword(searchInput);
        updateUrl(1, searchInput);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        updateUrl(newPage, searchKeyword);
    };

    const handleDeleteClick = (hospitalId: string, hospitalName: string) => {
        setDeleteModal({ open: true, hospitalId, hospitalName });
    };

    const confirmDelete = async () => {
        if (!deleteModal.hospitalId) return;
        setDeletingId(deleteModal.hospitalId);
        try {
            await adminApi.deleteHospital(deleteModal.hospitalId);
            toast.success(t('admin.hospitals.deleteSuccess'));
            fetchHospitals();
            setDeleteModal({ open: false, hospitalId: null, hospitalName: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('admin.hospitals.deleteError'));
        } finally {
            setDeletingId(null);
        }
    };

    const handleResendInvitation = async (hospitalId: string, hospitalName: string) => {
        setResendingId(hospitalId);
        try {
            await adminApi.resendInvitation(hospitalId);
            toast.success(t('admin.hospitals.resendSuccess', { name: hospitalName }));
            fetchHospitals();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('admin.hospitals.resendError'));
        } finally {
            setResendingId(null);
        }
    };

    const clearSearch = () => {
        setSearchInput('');
        setSearchKeyword('');
        setCurrentPage(1);
        updateUrl(1, '');
    };

    // Export Excel
    const handleExportExcel = async () => {
        try {
            const blob = await adminApi.exportHospitals(searchKeyword);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `hospitals_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success(t('admin.hospitals.exportSuccess'));
        } catch (error) {
            console.error('Export failed:', error);
            toast.error(t('admin.hospitals.exportError'));
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '---';
        return formatDateTime(dateString, 'dd/mm/yyyy');
    };

    const activeFilterCount = searchKeyword ? 1 : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-6">

                {/* Header */}
                <DashboardHeader
                    icon="🏥"
                    title={t('admin.hospitals.title')}
                    subtitle={t('admin.hospitals.subtitle')}
                    showHospital={false}
                />

                {/* Filters */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden mb-6">
                    <div className="p-5">
                        <div className="flex flex-col lg:flex-row gap-3">
                            <div className="flex-1">
                                <Input
                                    placeholder={t('admin.hospitals.searchPlaceholder')}
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    fullWidth
                                    icon="🔍"
                                />
                            </div>
                            <Button variant="primary" onClick={handleSearch} className="flex items-center gap-2">
                                🔍 {t('common.search')}
                            </Button>
                            <Button variant="outline" onClick={handleExportExcel} className="flex items-center gap-2">
                                📥 {t('admin.hospitals.exportExcel')}
                            </Button>
                            <Button variant="primary" onClick={() => setCreateModalOpen(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                                ➕ {t('admin.hospitals.addHospital')}
                            </Button>
                        </div>

                        {/* Active Filters */}
                        {activeFilterCount > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-xs text-gray-400">{t('admin.hospitals.activeFilters')}:</span>
                                {searchKeyword && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                                        🔍 {searchKeyword}
                                        <button onClick={clearSearch} className="ml-1 hover:text-blue-900">✕</button>
                                    </span>
                                )}
                                <button onClick={clearSearch} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                                    🗑️ {t('admin.hospitals.clearAllFilters')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Hospitals Table */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            📋 {t('admin.hospitals.list')}
                            <span className="text-sm font-normal text-gray-500">({totalElements} {t('admin.hospitals.hospitals')})</span>
                        </h2>
                        {!tableLoading && hospitals.length > 0 && (
                            <div className="text-xs text-gray-400">
                                {t('admin.hospitals.showing')} {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalElements)} / {totalElements}
                            </div>
                        )}
                    </div>

                    <div className="p-5">
                        {tableLoading ? (
                            <div className="flex justify-center py-12">
                                <LoadingSpinner size="lg" />
                            </div>
                        ) : tableError ? (
                            <div className="text-center py-12">
                                <div className="text-5xl mb-3">⚠️</div>
                                <p className="text-red-500">{tableError}</p>
                                <button onClick={fetchHospitals} className="mt-3 text-blue-500 hover:underline">{t('common.retry')}</button>
                            </div>
                        ) : hospitals.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-5xl mb-3">🏥</div>
                                <p className="text-gray-500">{t('admin.hospitals.noHospitals')}</p>
                                {activeFilterCount > 0 && (
                                    <button onClick={clearSearch} className="mt-3 text-blue-500 hover:underline">{t('admin.hospitals.clearAllFilters')}</button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">{t('admin.hospitals.name')}</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">{t('admin.hospitals.address')}</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">{t('admin.hospitals.phone')}</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">{t('common.email')}</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">{t('admin.hospitals.manager')}</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">{t('admin.hospitals.status')}</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">{t('admin.hospitals.createdAt')}</th>
                                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">{t('common.actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {hospitals.map((hospital) => (
                                                <tr key={hospital.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium text-gray-900 dark:text-white">{hospital.name}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{hospital.address}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{hospital.hotline || '---'}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{hospital.email || '---'}</td>
                                                    <td className="px-4 py-3">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{hospital.managerName || '---'}</p>
                                                        <p className="text-xs text-gray-400">{hospital.managerEmail}</p>
                                                    </td>
                                                    <td className="px-4 py-3">{getStatusBadge(hospital.status, t)}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{formatDate(hospital.createdAt)}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {hospital.status === HospitalStatus.PENDING_CONFIRMATION && (
                                                                <button
                                                                    onClick={() => handleResendInvitation(hospital.id, hospital.name)}
                                                                    disabled={resendingId === hospital.id}
                                                                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 transition disabled:opacity-50"
                                                                    title={t('admin.hospitals.resendInvitation')}
                                                                >
                                                                    📧
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDeleteClick(hospital.id, hospital.name)}
                                                                disabled={deletingId === hospital.id}
                                                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 transition disabled:opacity-50"
                                                                title={t('common.delete')}
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={handlePageChange}
                                            showJumpToPage={true}
                                            showFirstLast={true}
                                            showPrevNext={true}
                                            size="md"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateHospitalModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={fetchHospitals}
            />

            <DeleteHospitalModal
                isOpen={deleteModal.open}
                hospitalName={deleteModal.hospitalName}
                onClose={() => setDeleteModal({ open: false, hospitalId: null, hospitalName: '' })}
                onConfirm={confirmDelete}
                loading={deletingId !== null}
            />
        </div>
    );
};

export default AdminHospitalsPage;