import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { adminApi } from '../../../infrastructure/api/adminApi';
import { commonApi } from '../../../infrastructure/api/commonApi';
import type { HospitalResponse, ReceptionistListResponse } from '../../../core/types/api.response';
import DashboardHeader from '../../components/medical-dashboard/DashboardHeader';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Pagination from '../../components/shared/Pagination';
import ReceptionistDetailModal from './components/ReceptionistDetailModal';
import ApproveReceptionistModal from './components/ApproveReceptionistModal';
import RejectReceptionistModal from './components/RejectReceptionistModal';
import toast from 'react-hot-toast';

type StatusFilter = 'ALL' | 'PENDING' | 'VERIFIED' | 'APPROVED' | 'REJECTED' | 'INACTIVE';

const statusOptions = (t: (key: string) => string): { value: StatusFilter; label: string; icon: string; color: string }[] => [
    { value: 'ALL', label: t('admin.receptionists.statusAll'), icon: '📋', color: 'bg-gray-100 text-gray-700' },
    { value: 'PENDING', label: t('admin.receptionists.statusPending'), icon: '⏳', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'VERIFIED', label: t('admin.receptionists.statusVerified'), icon: '🟡', color: 'bg-blue-100 text-blue-700' },
    { value: 'APPROVED', label: t('admin.receptionists.statusApproved'), icon: '✅', color: 'bg-green-100 text-green-700' },
    { value: 'REJECTED', label: t('admin.receptionists.statusRejected'), icon: '❌', color: 'bg-red-100 text-red-700' },
    { value: 'INACTIVE', label: t('admin.receptionists.statusInactive'), icon: '🔒', color: 'bg-gray-100 text-gray-700' },
];

const getStatusBadge = (status: string, t: (key: string) => string) => {
    switch (status) {
        case 'PENDING':
            return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">⏳ {t('admin.receptionists.statusPending')}</span>;
        case 'VERIFIED':
            return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">🟡 {t('admin.receptionists.statusVerified')}</span>;
        case 'APPROVED':
            return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">✅ {t('admin.receptionists.statusApproved')}</span>;
        case 'REJECTED':
            return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">❌ {t('admin.receptionists.statusRejected')}</span>;
        case 'INACTIVE':
            return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">🔒 {t('admin.receptionists.statusInactive')}</span>;
        default:
            return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{status}</span>;
    }
};

const AdminReceptionistsPage = () => {
    const { t } = useAppTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy params từ URL
    const searchParams = new URLSearchParams(location.search);
    const urlPage = parseInt(searchParams.get('page') || '1');
    const urlKeyword = searchParams.get('keyword') || '';
    const urlStatus = (searchParams.get('status') as StatusFilter) || 'ALL';
    const urlHospitalId = searchParams.get('hospitalId') || '';

    // States
    const [receptionists, setReceptionists] = useState<ReceptionistListResponse[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(urlPage);
    const [pageSize] = useState(10);
    const [searchKeyword, setSearchKeyword] = useState(urlKeyword);
    const [searchInput, setSearchInput] = useState(urlKeyword);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>(urlStatus);
    const [hospitalFilter, setHospitalFilter] = useState(urlHospitalId);
    const [hospitals, setHospitals] = useState<HospitalResponse[]>([]);

    // Table loading state
    const [tableLoading, setTableLoading] = useState(true);
    const [tableError, setTableError] = useState<string | null>(null);

    // Modal states
    const [detailModal, setDetailModal] = useState<{ open: boolean; receptionistId: string | null }>({
        open: false,
        receptionistId: null,
    });
    const [approveModal, setApproveModal] = useState<{ open: boolean; receptionistId: string | null; receptionistName: string }>({
        open: false,
        receptionistId: null,
        receptionistName: '',
    });
    const [rejectModal, setRejectModal] = useState<{ open: boolean; receptionistId: string | null; receptionistName: string }>({
        open: false,
        receptionistId: null,
        receptionistName: '',
    });

    // Loading states for actions
    const [verifyingId, setVerifyingId] = useState<string | null>(null);
    const [rejectingId, setRejectingId] = useState<string | null>(null);

    // Fetch hospitals for filter
    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                const data = await commonApi.getHospitals();
                setHospitals(data);
            } catch (error) {
                console.error('Failed to fetch hospitals:', error);
            }
        };
        fetchHospitals();
    }, []);

    // Cập nhật URL
    const updateUrl = useCallback((page: number, keyword: string, status: StatusFilter, hospitalId: string) => {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        if (keyword) params.set('keyword', keyword);
        if (status && status !== 'ALL') params.set('status', status);
        if (hospitalId && hospitalId !== 'ALL') params.set('hospitalId', hospitalId);
        navigate(`/admin/receptionists?${params.toString()}`, { replace: true });
    }, [navigate]);

    // Fetch receptionists
    const fetchReceptionists = useCallback(async () => {
        setTableLoading(true);
        setTableError(null);
        try {
            const statusParam = statusFilter === 'ALL' ? undefined : statusFilter;
            const hospitalParam = hospitalFilter === 'ALL' || !hospitalFilter ? undefined : hospitalFilter;
            const response = await adminApi.getReceptionists(
                currentPage - 1,
                pageSize,
                searchKeyword,
                statusParam,
                hospitalParam,
                'createdAt',
                'desc'
            );
            setReceptionists(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (error) {
            console.error('Failed to fetch receptionists:', error);
            setTableError(t('common.loadError'));
        } finally {
            setTableLoading(false);
        }
    }, [currentPage, pageSize, searchKeyword, statusFilter, hospitalFilter, t]);

    const handleExportExcel = async () => {
        try {
            const statusParam = statusFilter === 'ALL' ? undefined : statusFilter;
            const hospitalParam = hospitalFilter === 'ALL' || !hospitalFilter ? undefined : hospitalFilter;
            const blob = await adminApi.exportReceptionists(searchKeyword, statusParam, hospitalParam);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `receptionists_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success(t('admin.receptionists.exportSuccess'));
        } catch (error) {
            console.error('Export failed:', error);
            toast.error(t('admin.receptionists.exportError'));
        }
    };

    useEffect(() => {
        fetchReceptionists();
    }, [fetchReceptionists]);

    // Handlers
    const handleSearch = () => {
        setCurrentPage(1);
        setSearchKeyword(searchInput);
        updateUrl(1, searchInput, statusFilter, hospitalFilter);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleStatusFilterChange = (status: StatusFilter) => {
        setCurrentPage(1);
        setStatusFilter(status);
        updateUrl(1, searchKeyword, status, hospitalFilter);
    };

    const handleHospitalFilterChange = (hospitalId: string) => {
        setCurrentPage(1);
        setHospitalFilter(hospitalId);
        updateUrl(1, searchKeyword, statusFilter, hospitalId);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        updateUrl(newPage, searchKeyword, statusFilter, hospitalFilter);
    };

    const handleViewDetail = (receptionistId: string) => {
        setDetailModal({ open: true, receptionistId });
    };

    const handleVerify = (receptionistId: string, receptionistName: string) => {
        setApproveModal({ open: true, receptionistId, receptionistName });
    };

    const handleReject = (receptionistId: string, receptionistName: string) => {
        setRejectModal({ open: true, receptionistId, receptionistName });
    };

    const confirmVerify = async () => {
        if (!approveModal.receptionistId) return;
        setVerifyingId(approveModal.receptionistId);
        try {
            await adminApi.verifyReceptionist(approveModal.receptionistId);
            toast.success(t('admin.receptionists.approveSuccess'));
            fetchReceptionists();
            setApproveModal({ open: false, receptionistId: null, receptionistName: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('admin.receptionists.approveError'));
        } finally {
            setVerifyingId(null);
        }
    };

    const confirmReject = async (reasonCode: string, note: string) => {
        if (!rejectModal.receptionistId) return;
        setRejectingId(rejectModal.receptionistId);
        try {
            await adminApi.rejectReceptionist(rejectModal.receptionistId, { reasonCode, note });
            toast.success(t('admin.receptionists.rejectSuccess'));
            fetchReceptionists();
            setRejectModal({ open: false, receptionistId: null, receptionistName: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('admin.receptionists.rejectError'));
        } finally {
            setRejectingId(null);
        }
    };

    const clearAllFilters = () => {
        setSearchInput('');
        setSearchKeyword('');
        setStatusFilter('PENDING');
        setHospitalFilter('');
        setCurrentPage(1);
        updateUrl(1, '', 'PENDING', '');
    };

    const statusOptionsList = statusOptions(t);
    const activeFilterCount = [
        searchKeyword ? 1 : 0,
        statusFilter !== 'PENDING' ? 1 : 0,
        hospitalFilter && hospitalFilter !== 'ALL' ? 1 : 0,
    ].reduce((a, b) => a + b, 0);

    // Render table content
    const renderTableContent = () => {
        if (tableError) {
            return (
                <div className="text-center py-12">
                    <div className="text-5xl mb-3">⚠️</div>
                    <p className="text-red-500">{tableError}</p>
                    <button onClick={fetchReceptionists} className="mt-3 text-blue-500 hover:underline">{t('common.retry')}</button>
                </div>
            );
        }

        if (receptionists.length === 0) {
            return (
                <div className="text-center py-12">
                    <div className="text-5xl mb-3">📭</div>
                    <p className="text-gray-500">{t('admin.receptionists.noReceptionists')}</p>
                    {activeFilterCount > 0 && (
                        <button onClick={clearAllFilters} className="mt-3 text-blue-500 hover:underline">{t('admin.receptionists.clearAllFilters')}</button>
                    )}
                </div>
            );
        }

        return (
            <>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">{t('admin.receptionists.avatar')}</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">{t('admin.receptionists.receptionistCode')}</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">{t('common.fullName')}</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">{t('common.email')}</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">{t('admin.receptionists.hospital')}</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">{t('common.status')}</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {receptionists.map((receptionist) => (
                                <tr key={receptionist.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition cursor-pointer" onClick={() => handleViewDetail(receptionist.id)}>
                                    <td className="px-4 py-3">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                                            {receptionist.fullName?.charAt(0) || 'R'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400">{receptionist.receptionistCode}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-900 dark:text-white">{receptionist.fullName}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{receptionist.phone || '---'}</p>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{receptionist.email}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{receptionist.hospitalName}</td>
                                    <td className="px-4 py-3">{getStatusBadge(receptionist.status, t)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                            {(receptionist.status === 'PENDING' || receptionist.status === 'VERIFIED') && (
                                                <>
                                                    <button
                                                        onClick={() => handleVerify(receptionist.id, receptionist.fullName)}
                                                        disabled={verifyingId === receptionist.id}
                                                        className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 transition disabled:opacity-50"
                                                        title={t('admin.receptionists.approve')}
                                                    >
                                                        ✅
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(receptionist.id, receptionist.fullName)}
                                                        disabled={rejectingId === receptionist.id}
                                                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 transition disabled:opacity-50"
                                                        title={t('admin.receptionists.reject')}
                                                    >
                                                        ❌
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleViewDetail(receptionist.id)}
                                                className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700 transition"
                                                title={t('common.viewDetail')}
                                            >
                                                👁️
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
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <DashboardHeader
                    icon="👩‍💼"
                    title={t('admin.receptionists.title')}
                    subtitle={t('admin.receptionists.subtitle')}
                    showHospital={false}
                />

                {/* Filters */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden mb-6">
                    <div className="p-5">
                        <div className="flex flex-col lg:flex-row gap-3">
                            <div className="flex-1">
                                <Input
                                    placeholder={t('admin.receptionists.searchPlaceholder')}
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    fullWidth
                                    icon="🔍"
                                />
                            </div>
                            <div className="w-full lg:w-48">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => handleStatusFilterChange(e.target.value as StatusFilter)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    {statusOptionsList.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.icon} {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full lg:w-48">
                                <select
                                    value={hospitalFilter}
                                    onChange={(e) => handleHospitalFilterChange(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">🏥 {t('admin.receptionists.allHospitals')}</option>
                                    {hospitals.map((hospital) => (
                                        <option key={hospital.id} value={hospital.id}>
                                            🏥 {hospital.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Button variant="primary" onClick={handleSearch} className="flex items-center gap-2">
                                🔍 {t('common.search')}
                            </Button>

                        </div>

                        {/* Active Filters */}
                        {activeFilterCount > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-xs text-gray-400">{t('admin.receptionists.activeFilters')}:</span>
                                {searchKeyword && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                                        🔍 {searchKeyword}
                                        <button onClick={() => {
                                            setSearchInput('');
                                            setSearchKeyword('');
                                            updateUrl(1, '', statusFilter, hospitalFilter);
                                        }} className="ml-1 hover:text-blue-900">✕</button>
                                    </span>
                                )}
                                {statusFilter !== 'PENDING' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                                        {statusOptionsList.find(s => s.value === statusFilter)?.icon}
                                        {statusOptionsList.find(s => s.value === statusFilter)?.label}
                                        <button onClick={() => handleStatusFilterChange('PENDING')} className="ml-1 hover:text-purple-900">✕</button>
                                    </span>
                                )}
                                {hospitalFilter && hospitalFilter !== 'ALL' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                                        🏥 {hospitals.find(h => h.id === hospitalFilter)?.name}
                                        <button onClick={() => handleHospitalFilterChange('')} className="ml-1 hover:text-green-900">✕</button>
                                    </span>
                                )}
                                <button onClick={clearAllFilters} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                                    🗑️ {t('admin.receptionists.clearAllFilters')}
                                </button>

                            </div>
                        )}
                    </div>
                </div>

                {/* Receptionists Table */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            📋 {t('admin.receptionists.list')}
                            <span className="text-sm font-normal text-gray-500">({totalElements} {t('admin.receptionists.receptionists')})</span>
                        </h2>
                        {!tableLoading && receptionists.length > 0 && (
                            <div className="text-xs text-gray-400">
                                {t('admin.receptionists.showing')} {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalElements)} / {totalElements}
                            </div>
                        )}
                        <Button variant="outline" onClick={handleExportExcel} className="flex items-center gap-2">
                            📥 {t('admin.receptionists.exportExcel')}
                        </Button>
                    </div>
                    <div className="p-5">
                        {tableLoading ? (
                            <div className="flex justify-center py-12">
                                <LoadingSpinner size="lg" />
                            </div>
                        ) : (
                            renderTableContent()
                        )}
                    </div>

                </div>
            </div>

            {/* Modals */}
            <ReceptionistDetailModal
                isOpen={detailModal.open}
                receptionistId={detailModal.receptionistId}
                onClose={() => setDetailModal({ open: false, receptionistId: null })}
            />

            <ApproveReceptionistModal
                isOpen={approveModal.open}
                receptionistName={approveModal.receptionistName}
                onClose={() => setApproveModal({ open: false, receptionistId: null, receptionistName: '' })}
                onConfirm={confirmVerify}
                loading={verifyingId === approveModal.receptionistId}
            />

            <RejectReceptionistModal
                isOpen={rejectModal.open}
                receptionistName={rejectModal.receptionistName}
                onClose={() => setRejectModal({ open: false, receptionistId: null, receptionistName: '' })}
                onConfirm={confirmReject}
                loading={rejectingId === rejectModal.receptionistId}
            />
        </div>
    );
};

export default AdminReceptionistsPage;