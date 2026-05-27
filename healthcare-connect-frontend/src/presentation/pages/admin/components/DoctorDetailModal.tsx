import { useState, useEffect } from 'react';
import { useAppTranslation } from '../../../../application/hooks/useAppTranslation';
import { adminApi } from '../../../../infrastructure/api/adminApi';
import type { DoctorDetailResponse, DoctorHistoryResponse } from '../../../../core/types/api.response';
import Modal from '../../../components/shared/Modal';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import { formatDateTime } from '../../../../shared/utils/dateUtils';

interface DoctorDetailModalProps {
  isOpen: boolean;
  doctorId: string | null;
  onClose: () => void;
}

const getStatusBadge = (status: string, t: (key: string) => string) => {
  switch (status) {
    case 'PENDING':
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">⏳ {t('admin.doctors.statusPending')}</span>;
    case 'VERIFIED':
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">🟡 {t('admin.doctors.statusVerified')}</span>;
    case 'APPROVED':
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">✅ {t('admin.doctors.statusApproved')}</span>;
    case 'REJECTED':
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">❌ {t('admin.doctors.statusRejected')}</span>;
    default:
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{status}</span>;
  }
};

const getActionLabel = (action: string, t: (key: string) => string): string => {
  switch (action) {
    case 'CREATE': return t('admin.doctors.historyCreate');
    case 'UPDATE': return t('admin.doctors.historyUpdate');
    case 'REAPPLY': return t('admin.doctors.historyReapply');
    case 'VERIFY': return t('admin.doctors.historyVerify');
    case 'APPROVE': return t('admin.doctors.historyApprove');
    case 'REJECT': return t('admin.doctors.historyReject');
    case 'ARCHIVE': return t('admin.doctors.historyArchive');
    default: return action;
  }
};

const DoctorDetailModal = ({ isOpen, doctorId, onClose }: DoctorDetailModalProps) => {
  const { t } = useAppTranslation();
  const [loading, setLoading] = useState(false);
  const [doctorDetail, setDoctorDetail] = useState<DoctorDetailResponse | null>(null);
  const [history, setHistory] = useState<DoctorHistoryResponse[]>([]);

  useEffect(() => {
    if (isOpen && doctorId) {
      fetchDoctorDetail();
    }
  }, [isOpen, doctorId]);

  const fetchDoctorDetail = async () => {
    if (!doctorId) return;
    setLoading(true);
    try {
      const [detail, historyData] = await Promise.all([
        adminApi.getDoctorDetail(doctorId),
        adminApi.getDoctorHistory(doctorId),
      ]);
      setDoctorDetail(detail);
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to fetch doctor detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCV = (cvUrl: string) => {
    if (!cvUrl) return;
    window.open(cvUrl, '_blank');
  };

  const formatPrice = (price: number): string => {
    return price?.toLocaleString('vi-VN') + 'đ' || '0đ';
  };

  const renderHistoryItem = (item: DoctorHistoryResponse, index: number) => {
    const isFirst = index === 0;
    const isLast = index === history.length - 1;
    
    return (
      <div key={item.id} className="relative pl-6 pb-4">
        {!isLast && (
          <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-600" />
        )}
        <div className={`absolute left-0 top-1 w-5 h-5 rounded-full flex items-center justify-center ${isFirst ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-500'}`}>
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 ml-2">
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
              <span className="font-medium text-gray-900 dark:text-white">
                {getActionLabel(item.action, t)}
              </span>
              {item.oldStatus && (
                <span className="text-xs text-gray-500 mx-1">
                  ({item.oldStatus} → {item.newStatus})
                </span>
              )}
              <p className="text-xs text-gray-500 mt-1">
                👤 {item.actorName} ({item.actorRole})
              </p>
              {item.note && (
                <p className="text-xs text-gray-500 mt-1">📝 {item.note}</p>
              )}
              {item.rejectionReason && (
                <p className="text-xs text-red-500 mt-1">
                  ❌ {t('admin.doctors.rejectReason')}: {item.rejectionReason}
                  {item.rejectionNote && ` - ${item.rejectionNote}`}
                </p>
              )}
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {formatDateTime(item.createdAt)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`👨‍⚕️ ${t('admin.doctors.doctorDetail')}`}
      showConfirm={false}
      showCancel={true}
      cancelText={t('common.close')}
      size="lg"
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      ) : !doctorDetail ? (
        <div className="text-center py-8 text-gray-500">{t('common.notFound')}</div>
      ) : (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          {/* Personal Information */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              📋 {t('admin.doctors.personalInfo')}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">{t('common.fullName')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{doctorDetail.fullName}</p>
              </div>
              <div>
                <p className="text-gray-500">{t('admin.doctors.doctorCode')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{doctorDetail.doctorCode}</p>
              </div>
              <div>
                <p className="text-gray-500">{t('common.email')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{doctorDetail.email}</p>
              </div>
              <div>
                <p className="text-gray-500">{t('common.phone')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{doctorDetail.phone || '---'}</p>
              </div>
              <div>
                <p className="text-gray-500">{t('admin.doctors.registeredDate')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatDateTime(doctorDetail.createdAt || '')}</p>
              </div>
              <div>
                <p className="text-gray-500">{t('common.status')}</p>
                <p>{getStatusBadge(doctorDetail.status, t)}</p>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              🩺 {t('admin.doctors.professionalInfo')}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">{t('admin.doctors.specialty')}</p>
                <p className="font-medium">{doctorDetail.specialtyName}</p>
              </div>
              <div>
                <p className="text-gray-500">{t('admin.doctors.department')}</p>
                <p className="font-medium">{doctorDetail.departmentName}</p>
              </div>
              <div>
                <p className="text-gray-500">{t('admin.doctors.hospital')}</p>
                <p className="font-medium">{doctorDetail.hospitalName}</p>
              </div>
              <div>
                <p className="text-gray-500">{t('common.address')}</p>
                <p className="font-medium">{doctorDetail.hospitalAddress}</p>
              </div>
              <div>
                <p className="text-gray-500">{t('admin.doctors.experience')}</p>
                <p className="font-medium">{doctorDetail.experienceYears} {t('doctor.yearsExperience')}</p>
              </div>
              <div>
                <p className="text-gray-500">{t('schedule.price')}</p>
                <p className="font-medium text-green-600">{formatPrice(doctorDetail.consultationFee)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">{t('applyDoctor.degree')}</p>
                <p className="font-medium">{doctorDetail.degree}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">{t('applyDoctor.biography')}</p>
                <p className="text-gray-600">{doctorDetail.biography || '---'}</p>
              </div>
              {doctorDetail.cvUrl && (
                <div className="col-span-2">
                  <button
                    onClick={() => handleDownloadCV(doctorDetail.cvUrl!)}
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    📄 {t('common.download')} CV
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                📜 {t('admin.doctors.approvalHistory')}
              </h3>
              <div className="relative">
                {history.map((item, index) => renderHistoryItem(item, index))}
              </div>
            </div>
          )}

          {/* Rejection Reason */}
          {doctorDetail.status === 'REJECTED' && (doctorDetail.rejectionReason || doctorDetail.rejectionNote) && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
              <h3 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2 flex items-center gap-2">
                ❌ {t('admin.doctors.rejectionReasonTitle')}
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400">
                {doctorDetail.rejectionReason}
                {doctorDetail.rejectionNote && ` - ${doctorDetail.rejectionNote}`}
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default DoctorDetailModal;