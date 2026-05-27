import { useState, useEffect } from 'react';
import { useAppTranslation } from '../../../../application/hooks/useAppTranslation';
import { adminApi } from '../../../../infrastructure/api/adminApi';
import type { AdminUserDetailResponse } from '../../../../core/types/api.response';
import Modal from '../../../components/shared/Modal';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import { formatDateTime } from '../../../../shared/utils/dateUtils';

interface UserDetailModalProps {
  isOpen: boolean;
  userId: string | null;
  onClose: () => void;
}

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

const getDoctorStatusBadge = (status: string, t: (key: string) => string): React.ReactNode => {
  switch (status) {
    case 'APPROVED':
      return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">✅ {t('doctor.status.approved')}</span>;
    case 'VERIFIED':
      return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">🟡 {t('doctor.status.verified')}</span>;
    case 'PENDING':
      return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">⏳ {t('doctor.status.pending')}</span>;
    case 'REJECTED':
      return <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">❌ {t('doctor.status.rejected')}</span>;
    default:
      return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">{status}</span>;
  }
};

const getReceptionistStatusBadge = (status: string, t: (key: string) => string): React.ReactNode => {
  switch (status) {
    case 'APPROVED':
      return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">✅ {t('receptionist.status.approved')}</span>;
    case 'VERIFIED':
      return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">🟡 {t('receptionist.status.verified')}</span>;
    case 'PENDING':
      return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">⏳ {t('receptionist.status.pending')}</span>;
    case 'REJECTED':
      return <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">❌ {t('receptionist.status.rejected')}</span>;
    default:
      return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">{status}</span>;
  }
};

const UserDetailModal = ({ isOpen, userId, onClose }: UserDetailModalProps) => {
  const { t } = useAppTranslation();
  const [loading, setLoading] = useState(false);
  const [userDetail, setUserDetail] = useState<AdminUserDetailResponse | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetail();
    }
  }, [isOpen, userId]);

  const fetchUserDetail = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await adminApi.getUserDetail(userId);
      setUserDetail(data);
    } catch (error) {
      console.error('Failed to fetch user detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCV = (cvUrl: string) => {
    window.open(cvUrl, '_blank');
  };

  const formatPrice = (price: number): string => {
    return price?.toLocaleString('vi-VN') + 'đ' || '0đ';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`👤 ${t('admin.userDetail.title')}`}
      showConfirm={false}
      showCancel={true}
      cancelText={t('common.close')}
      size="lg"
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      ) : !userDetail ? (
        <div className="text-center py-8 text-gray-500">{t('common.notFound')}</div>
      ) : (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          {/* Thông tin cơ bản */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              📋 {t('admin.userDetail.basicInfo')}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">{t('common.fullName')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{userDetail.fullName}</p>
              </div>
              <div>
                <p className="text-gray-500">{t('common.email')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{userDetail.email}</p>
              </div>
              <div>
                <p className="text-gray-500">{t('common.phone')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{userDetail.phone || '---'}</p>
              </div>
              <div>
                <p className="text-gray-500">{t('common.role')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{getRoleLabel(userDetail.role, t)}</p>
              </div>
              <div>
                <p className="text-gray-500">{t('common.status')}</p>
                <p>{userDetail.enabled ?
                  <span className="text-green-600">✅ {t('common.active')}</span> :
                  <span className="text-red-600">❌ {t('common.locked')}</span>}
                </p>
              </div>
              <div>
                <p className="text-gray-500">{t('common.createdAt')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatDateTime(userDetail.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Thông tin bác sĩ */}
          {userDetail.role === 'DOCTOR' && userDetail.doctorInfo && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                🩺 {t('admin.userDetail.doctorInfo')}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">{t('admin.userDetail.doctorCode')}</p>
                  <p className="font-medium">{userDetail.doctorInfo.doctorCode}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t('applyDoctor.specialty')}</p>
                  <p className="font-medium">{userDetail.doctorInfo.specialtyName}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t('applyDoctor.department')}</p>
                  <p className="font-medium">{userDetail.doctorInfo.departmentName}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t('applyDoctor.hospital')}</p>
                  <p className="font-medium">{userDetail.doctorInfo.hospitalName}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t('applyDoctor.experienceYears')}</p>
                  <p className="font-medium">{userDetail.doctorInfo.experienceYears} {t('doctor.yearsExperience')}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t('schedule.price')}</p>
                  <p className="font-medium text-green-600">{formatPrice(userDetail.doctorInfo.consultationFee)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">{t('common.status')}</p>
                  <p>{getDoctorStatusBadge(userDetail.doctorInfo.status, t)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">{t('applyDoctor.degree')}</p>
                  <p className="font-medium">{userDetail.doctorInfo.degree}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">{t('applyDoctor.biography')}</p>
                  <p className="text-gray-600">{userDetail.doctorInfo.biography || '---'}</p>
                </div>
                {userDetail.doctorInfo.cvUrl && (
                  <div className="col-span-2">
                    <a
                      href={userDetail.doctorInfo.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      📄 {t('common.download')} CV
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Thông tin quản lý bệnh viện */}
          {userDetail.role === 'HOSPITAL_MANAGER' && userDetail.managerInfo && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                🏥 {t('admin.userDetail.managerInfo')}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="col-span-2">
                  <p className="text-gray-500">{t('common.hospital')}</p>
                  <p className="font-medium">{userDetail.managerInfo.hospitalName}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">{t('common.address')}</p>
                  <p className="font-medium">{userDetail.managerInfo.hospitalAddress}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t('common.phone')}</p>
                  <p className="font-medium">{userDetail.managerInfo.hospitalPhone || '---'}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t('common.email')}</p>
                  <p className="font-medium">{userDetail.managerInfo.hospitalEmail || '---'}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t('admin.userDetail.acceptedAt')}</p>
                  <p className="font-medium">{formatDateTime(userDetail.managerInfo.acceptedAt)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Thông tin lễ tân */}
          {userDetail.role === 'RECEPTIONIST' && userDetail.receptionistInfo && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                👩‍💼 {t('admin.userDetail.receptionistInfo')}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">{t('admin.userDetail.receptionistCode')}</p>
                  <p className="font-medium">{userDetail.receptionistInfo.receptionistCode}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t('applyReceptionist.hospital')}</p>
                  <p className="font-medium">{userDetail.receptionistInfo.hospitalName}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">{t('common.address')}</p>
                  <p className="font-medium">{userDetail.receptionistInfo.hospitalAddress}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">{t('common.status')}</p>
                  <p>{getReceptionistStatusBadge(userDetail.receptionistInfo.status, t)}</p>
                </div>
                {userDetail.receptionistInfo.cvUrl && (
                  <div className="col-span-2">
                    <a
                      href={userDetail.receptionistInfo.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      📄 {t('common.download')} CV
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default UserDetailModal;