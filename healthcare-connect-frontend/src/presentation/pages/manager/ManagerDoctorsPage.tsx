import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { useAuth } from '../../../application/context/AuthContext';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';
import Pagination from '../../components/shared/Pagination';
import DashboardHeader from '../../components/medical-dashboard/DashboardHeader';

import type { DoctorResponse, PageResponse } from '../../../core/types/api.response';
import { DoctorStatus, RejectionReason } from '../../../core/constants/enums';
import toast from 'react-hot-toast';
import { managerApi } from '../../../infrastructure/api/managerApi';

type StatusFilter = 'ALL' | 'PENDING' | 'VERIFIED' | 'APPROVED' | 'REJECTED' | 'INACTIVE';

const getStatusOptions = (t: (key: string) => string) => [
  { value: 'ALL', label: t('doctor.status.all'), icon: '📋' },
  { value: 'PENDING', label: t('doctor.status.pending'), icon: '⏳' },
  { value: 'VERIFIED', label: t('doctor.status.verified'), icon: '🟡' },
  { value: 'APPROVED', label: t('doctor.status.approved'), icon: '✅' },
  { value: 'REJECTED', label: t('doctor.status.rejected'), icon: '❌' },
];

const ManagerDoctorsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useAppTranslation();
  const { user } = useAuth();
  
  const [tableLoading, setTableLoading] = useState(true);
  const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Lấy filter và page từ URL
  const searchParams = new URLSearchParams(location.search);
  const statusFilter = (searchParams.get('status') as StatusFilter) || 'ALL';
  const currentPage = parseInt(searchParams.get('page') || '0');

  // Modal states
  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    doctorId: string;
    doctorName: string;
  }>({ open: false, doctorId: '', doctorName: '' });
  const [rejectReason, setRejectReason] = useState<RejectionReason>(RejectionReason.OTHER);
  const [rejectNote, setRejectNote] = useState('');

  // Loading states for actions
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const statusOptions = getStatusOptions(t);

  // Hàm cập nhật URL
  const updateUrl = (status: string, page: number) => {
    const params = new URLSearchParams();
    params.set('status', status);
    params.set('page', page.toString());
    navigate(`/manager/doctors?${params.toString()}`, { replace: true });
  };

  // Hàm thay đổi filter
  const handleFilterChange = (status: string) => {
    updateUrl(status, 0);
  };

  // Hàm thay đổi trang
  const handlePageChange = (newPage: number) => {
    updateUrl(statusFilter, newPage - 1);
  };

  // Fetch data
  useEffect(() => {
    const fetchDoctors = async () => {
      setTableLoading(true);  
      try {
        const statusParam = statusFilter === 'ALL' ? undefined : statusFilter;
        const response: PageResponse<DoctorResponse> = await managerApi.getDoctorsByManager(currentPage, 10, statusParam);
        setDoctors(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
        toast.error(t('common.loadError'));
      } finally {
        setTableLoading(false);
      }
    };
    fetchDoctors();
  }, [currentPage, statusFilter, t]);

  // Approve doctor
  const handleApprove = async (doctorId: string) => {
    setApprovingId(doctorId);
    try {
      await managerApi.approveDoctor(doctorId);
      toast.success(t('manager.approveDoctorSuccess'));
      // Refresh list
      const statusParam = statusFilter === 'ALL' ? undefined : statusFilter;
      const response = await managerApi.getDoctorsByManager(currentPage, 10, statusParam);
      setDoctors(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      toast.error(t('manager.approveDoctorError'));
    } finally {
      setApprovingId(null);
    }
  };

  // Open reject modal
  const handleOpenReject = (doctorId: string, doctorName: string) => {
    setRejectModal({ open: true, doctorId, doctorName });
    setRejectReason(RejectionReason.OTHER);
    setRejectNote('');
  };

  // Confirm reject
  const handleConfirmReject = async () => {
    const { doctorId } = rejectModal;
    setRejectingId(doctorId);
    try {
      await managerApi.rejectDoctor(doctorId, { reasonCode: rejectReason, note: rejectNote });
      toast.success(t('manager.rejectDoctorSuccess'));
      setRejectModal({ open: false, doctorId: '', doctorName: '' });
      // Refresh list
      const statusParam = statusFilter === 'ALL' ? undefined : statusFilter;
      const response = await managerApi.getDoctorsByManager(currentPage, 10, statusParam);
      setDoctors(response.content);
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
      case DoctorStatus.APPROVED:
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">✅ {t('doctor.status.approved')}</span>;
      case DoctorStatus.VERIFIED:
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">🟡 {t('doctor.status.verified')}</span>;
      case DoctorStatus.PENDING:
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">⏳ {t('doctor.status.pending')}</span>;
      case DoctorStatus.REJECTED:
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">❌ {t('doctor.status.rejected')}</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return price?.toLocaleString('vi-VN') + 'đ' || '0đ';
  };

  const renderTableContent = () => {
    if (tableLoading) {
      return (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (doctors.length === 0) {
      return (
        <p className="text-center text-gray-500 py-8">{t('manager.doctors.noDoctors')}</p>
      );
    }

    return (
      <>
        <div className="space-y-4">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xl">👨‍⚕️</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {doctor.fullName}
                    </h3>
                    {getStatusBadge(doctor.status)}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('manager.receptionists.code')}: {doctor.doctorCode} - {doctor.departmentName} - {doctor.specialtyName}
                  </p>
                  <p className="text-sm text-gray-500">
                    📧 {doctor.email} - 📞 {doctor.phone}
                  </p>
                  <p className="text-sm text-gray-500">
                    🎓 {doctor.degree} - {doctor.experienceYears} {t('doctor.yearsExperience')}
                  </p>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-1">
                    💰 {formatPrice(doctor.consultationFee)}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {doctor.status === DoctorStatus.VERIFIED && (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleApprove(doctor.id)}
                        loading={approvingId === doctor.id}
                      >
                        ✅ {t('common.approve')}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleOpenReject(doctor.id, doctor.fullName)}
                        loading={rejectingId === doctor.id}
                      >
                        ❌ {t('common.reject')}
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/manager/doctors/${doctor.id}`)}
                  >
                    🔍 {t('common.viewDetail')}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

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
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header - LUÔN HIỂN THỊ */}
        <DashboardHeader
          icon="👨‍⚕️"
          title={t('manager.doctors.title')}
          subtitle={t('manager.doctors.subtitle')}
          showHospital={true}
          hospitalName={user?.fullName?.includes('Manager') ? t('manager.yourHospital') : ''}
        />

        {/* Filter Tabs - LUÔN HIỂN THỊ */}
        <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-2 mb-6">
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleFilterChange(opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === opt.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Doctors List Container - CHỈ PHẦN NÀY LOADING */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              📋 {t('manager.doctors.list')} ({totalElements})
            </h2>
          </div>

          <div className="p-4">
            {renderTableContent()}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModal.open}
        onClose={() => setRejectModal({ open: false, doctorId: '', doctorName: '' })}
        onConfirm={handleConfirmReject}
        title={t('manager.rejectTitle', { name: rejectModal.doctorName })}
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

export default ManagerDoctorsPage;