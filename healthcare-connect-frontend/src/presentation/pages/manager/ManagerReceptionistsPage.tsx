// presentation/pages/manager/ManagerReceptionistsPage.tsx

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { useAuth } from '../../../application/context/AuthContext';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';
import Pagination from '../../components/shared/Pagination';
import DashboardHeader from '../../components/medical-dashboard/DashboardHeader';

import { ReceptionistStatus, RejectionReason } from '../../../core/constants/enums';
import toast from 'react-hot-toast';
import type { ReceptionistForManager } from '../../../core/types';
import type { PageResponse } from '../../../core/types/api.response';
import { t } from 'i18next';
import { managerApi } from '../../../infrastructure/api/managerApi';

type StatusFilter = 'ALL' | 'PENDING' | 'VERIFIED' | 'APPROVED' | 'REJECTED';

const statusOptions: { value: StatusFilter; label: string; icon: string }[] = [
    { value: 'ALL', label: t('doctor.status.all'), icon: '📋' },
    { value: 'PENDING', label: t('doctor.status.pending'), icon: '⏳' },
    { value: 'VERIFIED', label: t('doctor.status.verified'), icon: '🟡' },
    { value: 'APPROVED', label: t('doctor.status.approved'), icon: '✅' },
    { value: 'REJECTED', label: t('doctor.status.rejected'), icon: '❌' },
];

const ManagerReceptionistsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useAppTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [receptionists, setReceptionists] = useState<ReceptionistForManager[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Lấy filter và page từ URL
  const searchParams = new URLSearchParams(location.search);
  const statusFilter = (searchParams.get('status') as StatusFilter) || 'ALL';
  const currentPage = parseInt(searchParams.get('page') || '0');
  
  // Modal states
  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    receptionistId: string;
    receptionistName: string;
  }>({ open: false, receptionistId: '', receptionistName: '' });
  const [rejectReason, setRejectReason] = useState<RejectionReason>(RejectionReason.OTHER);
  const [rejectNote, setRejectNote] = useState('');
  
  // Loading states
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  // Cập nhật URL
  const updateUrl = (status: string, page: number) => {
    const params = new URLSearchParams();
    params.set('status', status);
    params.set('page', page.toString());
    navigate(`/manager/receptionists?${params.toString()}`, { replace: true });
  };

  const handleFilterChange = (status: string) => {
    updateUrl(status, 0);
  };

  const handlePageChange = (newPage: number) => {
    updateUrl(statusFilter, newPage - 1);
  };

  // Fetch data
  useEffect(() => {
    const fetchReceptionists = async () => {
      setLoading(true);
      try {
        const statusParam = statusFilter === 'ALL' ? undefined : statusFilter;
        const response: PageResponse<ReceptionistForManager> = await managerApi.getReceptionistsByManager(currentPage, 10, statusParam);
        setReceptionists(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } catch (error) {
        console.error('Failed to fetch receptionists:', error);
        toast.error(t('common.loadError'));
      } finally {
        setLoading(false);
      }
    };
    fetchReceptionists();
  }, [currentPage, statusFilter, t]);

  // Approve
  const handleApprove = async (receptionistId: string) => {
    setApprovingId(receptionistId);
    try {
      await managerApi.approveReceptionist(receptionistId);
      toast.success(t('manager.approveReceptionistSuccess'));
      // Refresh list
      const statusParam = statusFilter === 'ALL' ? undefined : statusFilter;
      const response = await managerApi.getReceptionistsByManager(currentPage, 10, statusParam);
      setReceptionists(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      toast.error(t('manager.approveReceptionistError'));
    } finally {
      setApprovingId(null);
    }
  };

  // Open reject modal
  const handleOpenReject = (receptionistId: string, receptionistName: string) => {
    setRejectModal({ open: true, receptionistId, receptionistName });
    setRejectReason(RejectionReason.OTHER);
    setRejectNote('');
  };

  // Confirm reject
  const handleConfirmReject = async () => {
    const { receptionistId } = rejectModal;
    setRejectingId(receptionistId);
    try {
      await managerApi.rejectReceptionist(receptionistId, { reasonCode: rejectReason, note: rejectNote });
      toast.success(t('manager.rejectReceptionistSuccess'));
      setRejectModal({ open: false, receptionistId: '', receptionistName: '' });
      // Refresh list
      const statusParam = statusFilter === 'ALL' ? undefined : statusFilter;
      const response = await managerApi.getReceptionistsByManager(currentPage, 10, statusParam);
      setReceptionists(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      toast.error(t('manager.rejectError'));
    } finally {
      setRejectingId(null);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case ReceptionistStatus.APPROVED:
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">✅ {t('receptionist.status.approved')}</span>;
      case ReceptionistStatus.VERIFIED:
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">🟡 {t('receptionist.status.verified')}</span>;
      case ReceptionistStatus.PENDING:
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">⏳ {t('receptionist.status.pending')}</span>;
      case ReceptionistStatus.REJECTED:
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">❌ {t('receptionist.status.rejected')}</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  if (loading && currentPage === 0) {
    return <LoadingSpinner fullScreen variant="dots" text={t('common.loading')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6">
        <DashboardHeader
          icon="👩‍💼"
          title={t('manager.receptionists.title')}
          subtitle={t('manager.receptionists.subtitle')}
          showHospital={true}
          hospitalName={user?.fullName?.includes('Manager') ? t('manager.yourHospital') : ''}
        />

        {/* Filter Tabs */}
        <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-2 mb-6">
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleFilterChange(opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === opt.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Receptionists List */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              📋 {t('manager.receptionists.list')} ({totalElements})
            </h2>
          </div>

          <div className="p-4">
            {receptionists.length === 0 ? (
              <p className="text-center text-gray-500 py-8">{t('manager.receptionists.noReceptionists')}</p>
            ) : (
              <div className="space-y-4">
                {receptionists.map((receptionist) => (
                  <div key={receptionist.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xl">👩‍💼</span>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {receptionist.fullName}
                          </h3>
                          {getStatusBadge(receptionist.status)}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Mã: {receptionist.receptionistCode}
                        </p>
                        <p className="text-sm text-gray-500">
                          📧 {receptionist.email} - 📞 {receptionist.phone}
                        </p>
                        <p className="text-xs text-gray-400">
                          📅 Đăng ký: {formatDate(receptionist.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {receptionist.status === ReceptionistStatus.VERIFIED && (
                          <>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleApprove(receptionist.id)}
                              loading={approvingId === receptionist.id}
                            >
                              ✅ {t('common.approve')}
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleOpenReject(receptionist.id, receptionist.fullName)}
                              loading={rejectingId === receptionist.id}
                            >
                              ❌ {t('common.reject')}
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/manager/receptionists/${receptionist.id}`)}
                        >
                          🔍 {t('common.viewDetail')}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage + 1}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  showJumpToPage={true}
                  showFirstLast={true}
                  showPrevNext={true}
                  size="md"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModal.open}
        onClose={() => setRejectModal({ open: false, receptionistId: '', receptionistName: '' })}
        onConfirm={handleConfirmReject}
        title={t('manager.rejectTitle', { name: rejectModal.receptionistName })}
        variant="danger"
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        loading={rejectingId !== null}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('manager.rejectReason')} <span className="text-red-500">*</span>
            </label>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value as RejectionReason)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            >
              <option value={RejectionReason.INVALID_CERTIFICATE}>{t('rejectionReason.invalidCertificate')}</option>
              <option value={RejectionReason.MISSING_DOCUMENTS}>{t('rejectionReason.missingDocuments')}</option>
              <option value={RejectionReason.INSUFFICIENT_EXPERIENCE}>{t('rejectionReason.insufficientExperience')}</option>
              <option value={RejectionReason.PROFILE_MISMATCH}>{t('rejectionReason.profileMismatch')}</option>
              <option value={RejectionReason.OTHER}>{t('rejectionReason.other')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('manager.rejectNote')}
            </label>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              placeholder={t('manager.rejectNotePlaceholder')}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManagerReceptionistsPage;