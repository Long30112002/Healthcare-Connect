import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { adminApi } from '../../../infrastructure/api/adminApi';
import type { AdminUserListResponse, PageResponse } from '../../../core/types/api.response';
import DashboardHeader from '../../components/medical-dashboard/DashboardHeader';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Pagination from '../../components/shared/Pagination';
import UserDetailModal from './components/UserDetailModal';
import LockUserModal from './components/LockUserModal';
import UnlockUserModal from './components/UnlockUserModal';
import ResetPasswordModal from './components/ResetPasswordModal';
import toast from 'react-hot-toast';

type RoleFilter = 'ALL' | 'PATIENT' | 'DOCTOR' | 'RECEPTIONIST' | 'HOSPITAL_MANAGER' | 'ADMIN';
type StatusFilter = 'ALL' | 'ACTIVE' | 'LOCKED';
type SortBy = 'createdAt' | 'fullName' | 'email';
type SortDir = 'asc' | 'desc';

const roleOptions = (t: (key: string) => string): { value: RoleFilter; label: string; icon: string; color: string }[] => [
    { value: 'ALL', label: t('admin.users.filterAll'), icon: '📋', color: 'bg-gray-100 text-gray-700' },
    { value: 'PATIENT', label: t('role.PATIENT'), icon: '👤', color: 'bg-blue-100 text-blue-700' },
    { value: 'DOCTOR', label: t('role.DOCTOR'), icon: '👨‍⚕️', color: 'bg-cyan-100 text-cyan-700' },
    { value: 'RECEPTIONIST', label: t('role.RECEPTIONIST'), icon: '👩‍💼', color: 'bg-purple-100 text-purple-700' },
    { value: 'HOSPITAL_MANAGER', label: t('role.HOSPITAL_MANAGER'), icon: '🏥', color: 'bg-green-100 text-green-700' },
    { value: 'ADMIN', label: t('role.ADMIN'), icon: '👑', color: 'bg-red-100 text-red-700' },
];

const statusOptions = (t: (key: string) => string): { value: StatusFilter; label: string; icon: string; color: string }[] => [
    { value: 'ALL', label: t('admin.users.statusAll'), icon: '📋', color: 'bg-gray-100 text-gray-700' },
    { value: 'ACTIVE', label: t('common.active'), icon: '✅', color: 'bg-green-100 text-green-700' },
    { value: 'LOCKED', label: t('common.locked'), icon: '🔒', color: 'bg-red-100 text-red-700' },
];

const sortOptions = (t: (key: string) => string): { value: SortBy; label: string; icon: string }[] => [
    { value: 'createdAt', label: t('admin.users.sortByNewest'), icon: '📅' },
    { value: 'fullName', label: t('admin.users.sortByName'), icon: '👤' },
    { value: 'email', label: t('admin.users.sortByEmail'), icon: '📧' },
];

const getRoleIcon = (role: string): string => {
    switch (role) {
        case 'PATIENT': return '👤';
        case 'DOCTOR': return '👨‍⚕️';
        case 'RECEPTIONIST': return '👩‍💼';
        case 'HOSPITAL_MANAGER': return '🏥';
        case 'ADMIN': return '👑';
        default: return '📋';
    }
};

const getRoleLabel = (role: string, t: (key: string) => string): string => {
    switch (role) {
        case 'PATIENT': return t('role.PATIENT');
        case 'DOCTOR': return t('role.DOCTOR');
        case 'RECEPTIONIST': return t('role.RECEPTIONIST');
        case 'HOSPITAL_MANAGER': return t('role.HOSPITAL_MANAGER');
        case 'ADMIN': return t('role.ADMIN');
        default: return role;
    }
};



const getStatusBadge = (enabled: boolean, t: (key: string) => string) => {
    if (enabled) {
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">✅ {t('common.active')}</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">❌ {t('common.locked')}</span>;
};

const AdminUsersPage = () => {
    const { t } = useAppTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy params từ URL
    const searchParams = new URLSearchParams(location.search);
    const urlPage = parseInt(searchParams.get('page') || '1');
    const urlKeyword = searchParams.get('keyword') || '';
    const urlRole = (searchParams.get('role') as RoleFilter) || 'ALL';
    const urlStatus = (searchParams.get('status') as StatusFilter) || 'ALL';
    const urlSortBy = (searchParams.get('sortBy') as SortBy) || 'createdAt';
    const urlSortDir = (searchParams.get('sortDir') as SortDir) || 'desc';

    // States
    const [, setLoading] = useState(true);
    const [users, setUsers] = useState<AdminUserListResponse[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(urlPage);
    const [pageSize] = useState(10);
    const [searchKeyword, setSearchKeyword] = useState(urlKeyword);
    const [searchInput, setSearchInput] = useState(urlKeyword);
    const [roleFilter, setRoleFilter] = useState<RoleFilter>(urlRole);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>(urlStatus);
    const [sortBy, setSortBy] = useState<SortBy>(urlSortBy);
    const [sortDir, setSortDir] = useState<SortDir>(urlSortDir);

    // Table loading state
    const [tableLoading, setTableLoading] = useState(true);
    const [tableError, setTableError] = useState<string | null>(null);

    // Modal states
    const [detailModal, setDetailModal] = useState<{ open: boolean; userId: string | null }>({
        open: false,
        userId: null,
    });
    const [lockModal, setLockModal] = useState<{ open: boolean; userId: string | null; userName: string }>({
        open: false,
        userId: null,
        userName: '',
    });
    const [unlockModal, setUnlockModal] = useState<{ open: boolean; userId: string | null; userName: string }>({
        open: false,
        userId: null,
        userName: '',
    });
    const [resetModal, setResetModal] = useState<{ open: boolean; userId: string | null; userName: string; userEmail: string }>({
        open: false,
        userId: null,
        userName: '',
        userEmail: '',
    });

    // Loading states for actions
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [resettingId, setResettingId] = useState<string | null>(null);

    // Cập nhật URL khi filter thay đổi
    const updateUrl = useCallback((
        page: number,
        keyword: string,
        role: RoleFilter,
        status: StatusFilter,
        sortByVal: SortBy,
        sortDirVal: SortDir
    ) => {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        if (keyword) params.set('keyword', keyword);
        if (role && role !== 'ALL') params.set('role', role);
        if (status && status !== 'ALL') params.set('status', status);
        if (sortByVal && sortByVal !== 'createdAt') params.set('sortBy', sortByVal);
        if (sortDirVal && sortDirVal !== 'desc') params.set('sortDir', sortDirVal);
        navigate(`/admin/users?${params.toString()}`, { replace: true });
    }, [navigate]);

    // Fetch users
    const fetchUsers = useCallback(async () => {
        setTableLoading(true);
        setTableError(null);
        try {
            const enabledParam = statusFilter === 'ACTIVE' ? true : statusFilter === 'LOCKED' ? false : undefined;
            const response: PageResponse<AdminUserListResponse> = await adminApi.getUsers(
                currentPage - 1,
                pageSize,
                searchKeyword,
                roleFilter,
                enabledParam,
                sortBy,
                sortDir
            );
            setUsers(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setTableError(t('common.loadError'));
        } finally {
            setTableLoading(false);
            setLoading(false);
        }
    }, [currentPage, pageSize, searchKeyword, roleFilter, statusFilter, sortBy, sortDir, t]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Handlers
    const handleSearch = () => {
        const newPage = 1;
        setCurrentPage(newPage);
        setSearchKeyword(searchInput);
        updateUrl(newPage, searchInput, roleFilter, statusFilter, sortBy, sortDir);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleExportExcel = async () => {
        try {
            const enabledParam = statusFilter === 'ACTIVE' ? true : statusFilter === 'LOCKED' ? false : undefined;
            const blob = await adminApi.exportUsers(searchKeyword, roleFilter, enabledParam);

            // Tạo URL cho blob và download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const date = new Date().toISOString().split('T')[0];
            link.download = `users_${date}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(t('admin.users.exportSuccess'));
        } catch (error) {
            console.error('Export failed:', error);
            toast.error(t('admin.users.exportError'));
        }
    };

    const handleRoleFilterChange = (role: RoleFilter) => {
        const newPage = 1;
        setCurrentPage(newPage);
        setRoleFilter(role);
        updateUrl(newPage, searchKeyword, role, statusFilter, sortBy, sortDir);
    };

    const handleStatusFilterChange = (status: StatusFilter) => {
        const newPage = 1;
        setCurrentPage(newPage);
        setStatusFilter(status);
        updateUrl(newPage, searchKeyword, roleFilter, status, sortBy, sortDir);
    };

    const handleSortChange = (sortByVal: SortBy) => {
        const newSortDir = sortBy === sortByVal && sortDir === 'asc' ? 'desc' : 'asc';
        const newPage = 1;
        setCurrentPage(newPage);
        setSortBy(sortByVal);
        setSortDir(newSortDir);
        updateUrl(newPage, searchKeyword, roleFilter, statusFilter, sortByVal, newSortDir);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        updateUrl(newPage, searchKeyword, roleFilter, statusFilter, sortBy, sortDir);
    };

    const clearAllFilters = () => {
        setSearchInput('');
        setSearchKeyword('');
        setRoleFilter('ALL');
        setStatusFilter('ALL');
        setSortBy('createdAt');
        setSortDir('desc');
        setCurrentPage(1);
        updateUrl(1, '', 'ALL', 'ALL', 'createdAt', 'desc');
    };

    const handleViewDetail = (userId: string) => {
        setDetailModal({ open: true, userId });
    };

    const handleToggleStatus = async (userId: string, currentStatus: boolean, userName: string) => {
        if (currentStatus) {
            setLockModal({ open: true, userId, userName });
        } else {
            setUnlockModal({ open: true, userId, userName });
        }
    };

    const confirmLock = async (reason: string) => {
        if (!lockModal.userId) return;
        setTogglingId(lockModal.userId);
        try {
            await adminApi.toggleUserStatus(lockModal.userId, reason);
            toast.success(t('admin.users.lockSuccess'));
            fetchUsers();
            setLockModal({ open: false, userId: null, userName: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('admin.users.lockError'));
        } finally {
            setTogglingId(null);
        }
    };

    const confirmUnlock = async () => {
        if (!unlockModal.userId) return;
        setTogglingId(unlockModal.userId);
        try {
            await adminApi.toggleUserStatus(unlockModal.userId);
            toast.success(t('admin.users.unlockSuccess'));
            fetchUsers();
            setUnlockModal({ open: false, userId: null, userName: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('admin.users.unlockError'));
        } finally {
            setTogglingId(null);
        }
    };

    const handleResetPassword = (userId: string, userName: string, userEmail: string) => {
        setResetModal({ open: true, userId, userName, userEmail });
    };

    const confirmResetPassword = async () => {
        if (!resetModal.userId) return;
        setResettingId(resetModal.userId);
        try {
            await adminApi.resetUserPassword(resetModal.userId);
            toast.success(t('admin.users.resetSuccess'));
            setResetModal({ open: false, userId: null, userName: '', userEmail: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('admin.users.resetError'));
        } finally {
            setResettingId(null);
        }
    };

    const roleOptionsList = roleOptions(t);
    const statusOptionsList = statusOptions(t);
    const sortOptionsList = sortOptions(t);

    // Đếm số filter đang active
    const activeFilterCount = [
        searchKeyword ? 1 : 0,
        roleFilter !== 'ALL' ? 1 : 0,
        statusFilter !== 'ALL' ? 1 : 0,
    ].reduce((a, b) => a + b, 0);

    // Render sort indicator
    const getSortIcon = (field: SortBy) => {
        if (sortBy !== field) return '↕️';
        return sortDir === 'asc' ? '↑' : '↓';
    };

    // Render table content
    const renderTableContent = () => {
        if (tableError) {
            return (
                <div className="text-center py-12">
                    <div className="text-5xl mb-3">⚠️</div>
                    <p className="text-red-500 mb-3">{tableError}</p>
                    <button onClick={() => fetchUsers()} className="text-blue-500 hover:underline">
                        {t('common.retry')}
                    </button>
                </div>
            );
        }

        if (users.length === 0) {
            return (
                <div className="text-center py-12">
                    <div className="text-5xl mb-3">📭</div>
                    <p className="text-gray-500">{t('common.noData')}</p>
                    {activeFilterCount > 0 && (
                        <button onClick={clearAllFilters} className="mt-3 text-blue-500 hover:underline">
                            {t('admin.users.clearAllFilters')}
                        </button>
                    )}
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {t('admin.users.avatar')}
                            </th>
                            <th
                                className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600 transition"
                                onClick={() => handleSortChange('fullName')}
                            >
                                <div className="flex items-center gap-1">
                                    {t('common.fullName')} <span className="text-xs">{getSortIcon('fullName')}</span>
                                </div>
                            </th>
                            <th
                                className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600 transition"
                                onClick={() => handleSortChange('email')}
                            >
                                <div className="flex items-center gap-1">
                                    {t('common.email')} <span className="text-xs">{getSortIcon('email')}</span>
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {t('common.phone')}
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {t('common.role')}
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {t('common.status')}
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {t('common.actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map((userItem) => (
                            <tr
                                key={userItem.id}
                                className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition cursor-pointer"
                                onClick={() => handleViewDetail(userItem.id)}
                            >
                                <td className="px-4 py-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                                        {userItem.fullName?.charAt(0) || 'U'}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="font-medium text-gray-900 dark:text-white">{userItem.fullName}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{new Date(userItem.createdAt).toLocaleDateString('vi-VN')}</p>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{userItem.email}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{userItem.phone || '---'}</td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                                        <span>{getRoleIcon(userItem.role)}</span>
                                        <span>{getRoleLabel(userItem.role, t)}</span>
                                    </span>
                                </td>
                                <td className="px-4 py-3">{getStatusBadge(userItem.enabled, t)}</td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => handleToggleStatus(userItem.id, userItem.enabled, userItem.fullName)}
                                            disabled={togglingId === userItem.id || userItem.role === 'ADMIN'}
                                            className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 transition disabled:opacity-50"
                                            title={userItem.enabled ? t('admin.users.lock') : t('admin.users.unlock')}
                                        >
                                            {userItem.enabled ? '🔒' : '🔓'}
                                        </button>
                                        <button
                                            onClick={() => handleResetPassword(userItem.id, userItem.fullName, userItem.email)}
                                            disabled={resettingId === userItem.id}
                                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 transition disabled:opacity-50"
                                            title={t('admin.users.resetPassword')}
                                        >
                                            🔄
                                        </button>
                                        <button
                                            onClick={() => handleViewDetail(userItem.id)}
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
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-6">

                {/* Header */}
                <DashboardHeader
                    icon="👥"
                    title={t('admin.users.title')}
                    subtitle={t('admin.users.subtitle')}
                    showHospital={false}
                />

                {/* Filters Card */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden mb-6">
                    <div className="p-5">
                        {/* Basic Filters Row */}
                        <div className="flex flex-col lg:flex-row gap-3">
                            <div className="flex-1">
                                <Input
                                    placeholder={t('admin.users.searchPlaceholder')}
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    fullWidth
                                    icon="🔍"
                                />
                            </div>
                            <div className="w-full lg:w-48">
                                <select
                                    value={roleFilter}
                                    onChange={(e) => handleRoleFilterChange(e.target.value as RoleFilter)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    {roleOptionsList.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.icon} {opt.label}
                                        </option>
                                    ))}
                                </select>
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
                            <Button variant="primary" onClick={handleSearch} className="flex items-center gap-2">
                                🔍 {t('common.search')}
                            </Button>
                        </div>

                        {/* Sort Row */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    📊 {t('admin.users.sortBy')}:
                                </span>
                                {sortOptionsList.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleSortChange(opt.value)}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition-all flex items-center gap-1 ${sortBy === opt.value
                                            ? 'bg-blue-500 text-white shadow-md'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {opt.icon} {opt.label}
                                        {sortBy === opt.value && <span className="text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                                    </button>
                                ))}
                            </div>

                            {/* Active Filters Tags */}
                            {activeFilterCount > 0 && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs text-gray-400">{t('admin.users.activeFilters')}:</span>
                                    {searchKeyword && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                                            🔍 {searchKeyword}
                                            <button onClick={() => {
                                                setSearchInput('');
                                                setSearchKeyword('');
                                                updateUrl(1, '', roleFilter, statusFilter, sortBy, sortDir);
                                            }} className="ml-1 hover:text-blue-900">✕</button>
                                        </span>
                                    )}
                                    {roleFilter !== 'ALL' && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                                            🏷️ {roleOptionsList.find(r => r.value === roleFilter)?.label}
                                            <button onClick={() => handleRoleFilterChange('ALL')} className="ml-1 hover:text-purple-900">✕</button>
                                        </span>
                                    )}
                                    {statusFilter !== 'ALL' && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                                            {statusFilter === 'ACTIVE' ? '✅' : '🔒'} {statusOptionsList.find(s => s.value === statusFilter)?.label}
                                            <button onClick={() => handleStatusFilterChange('ALL')} className="ml-1 hover:text-green-900">✕</button>
                                        </span>
                                    )}
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                                    >
                                        🗑️ {t('admin.users.clearAllFilters')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            📋 {t('admin.users.list')}
                            <span className="text-sm font-normal text-gray-500">({totalElements} {t('admin.users.users')})</span>
                        </h2>
                        {!tableLoading && users.length > 0 && (
                            <div className="text-xs text-gray-400">
                                {t('admin.users.showing')} {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalElements)} / {totalElements}
                            </div>
                        )}
                        <Button variant="outline" onClick={handleExportExcel} className="flex items-center gap-2">
                            📥 {t('admin.users.exportExcel')}
                        </Button>
                    </div>


                    <div className="p-5">
                        {tableLoading ? (
                            <div className="flex justify-center py-12">
                                <LoadingSpinner size="lg" />
                            </div>
                        ) : (
                            <>
                                {renderTableContent()}

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
            <UserDetailModal
                isOpen={detailModal.open}
                userId={detailModal.userId}
                onClose={() => setDetailModal({ open: false, userId: null })}
            />

            <LockUserModal
                isOpen={lockModal.open}
                userName={lockModal.userName}
                onClose={() => setLockModal({ open: false, userId: null, userName: '' })}
                onConfirm={confirmLock}
                loading={togglingId === lockModal.userId}
            />

            <UnlockUserModal
                isOpen={unlockModal.open}
                userName={unlockModal.userName}
                onClose={() => setUnlockModal({ open: false, userId: null, userName: '' })}
                onConfirm={confirmUnlock}
                loading={togglingId === unlockModal.userId}
            />

            <ResetPasswordModal
                isOpen={resetModal.open}
                userName={resetModal.userName}
                userEmail={resetModal.userEmail}
                onClose={() => setResetModal({ open: false, userId: null, userName: '', userEmail: '' })}
                onConfirm={confirmResetPassword}
                loading={resettingId === resetModal.userId}
            />
        </div>
    );
};

export default AdminUsersPage;