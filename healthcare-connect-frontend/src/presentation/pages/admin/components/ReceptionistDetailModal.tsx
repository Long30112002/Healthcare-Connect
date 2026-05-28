import { useState, useEffect } from 'react';
import { useAppTranslation } from '../../../../application/hooks/useAppTranslation';
import { adminApi } from '../../../../infrastructure/api/adminApi';
import Modal from '../../../components/shared/Modal';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import { formatDateTime } from '../../../../shared/utils/dateUtils';
import { ReceptionistStatus } from '../../../../core/constants/enums';
import type { ReceptionistDetailResponse, ReceptionistHistoryResponse } from '../../../../core/types/api.response';

interface ReceptionistDetailModalProps {
  isOpen: boolean;
  receptionistId: string | null;
  onClose: () => void;
}

const getStatusBadge = (status: string, t: (key: string) => string) => {
  switch (status) {
    case ReceptionistStatus.PENDING:
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">⏳ {t('receptionist.status.pending')}</span>;
    case ReceptionistStatus.VERIFIED:
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">🟡 {t('receptionist.status.verified')}</span>;
    case ReceptionistStatus.APPROVED:
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">✅ {t('receptionist.status.approved')}</span>;
    case ReceptionistStatus.REJECTED:
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">❌ {t('receptionist.status.rejected')}</span>;
    case ReceptionistStatus.INACTIVE:
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">🔒 {t('receptionist.status.inactive')}</span>;
    default:
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{status}</span>;
  }
};

const getActionLabel = (action: string, t: (key: string) => string): string => {
  switch (action) {
    case 'CREATE': return t('admin.receptionists.historyCreate');
    case 'UPDATE': return t('admin.receptionists.historyUpdate');
    case 'REAPPLY': return t('admin.receptionists.historyReapply');
    case 'VERIFY': return t('admin.receptionists.historyVerify');
    case 'APPROVE': return t('admin.receptionists.historyApprove');
    case 'REJECT': return t('admin.receptionists.historyReject');
    default: return action;
  }
};

const ReceptionistDetailModal = ({ isOpen, receptionistId, onClose }: ReceptionistDetailModalProps) => {
  const { t } = useAppTranslation();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<ReceptionistDetailResponse | null>(null);
  const [history, setHistory] = useState<ReceptionistHistoryResponse[]>([]);

  useEffect(() => {
    if (isOpen && receptionistId) {
      fetchDetail();
    }
  }, [isOpen, receptionistId]);

  const fetchDetail = async () => {
    if (!receptionistId) return;
    setLoading(true);
    try {
      const data = await adminApi.getReceptionistDetail(receptionistId);
      setDetail(data);
      setHistory(data.history || []);
    } catch (error) {
      console.error('Failed to fetch receptionist detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCV = (cvUrl: string) => {
    if (!cvUrl) return;
    window.open(cvUrl, '_blank');
  };

  const renderHistoryItem = (item: ReceptionistHistoryResponse, index: number) => {
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
                  ❌ {t('admin.receptionists.rejectReason')}: {item.rejectionReason}
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
      title={`👩‍💼 ${t('admin.receptionists.receptionistDetail')}`}
      showConfirm={false}
      showCancel={true}
      cancelText={t('common.close')}
      size="lg"
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      ) : !detail ? (
        <div className="text-center py-8 text-gray-500">{t('common.notFound')}</div>
      ) : (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          {/* Personal Information */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              📋 {t('admin.receptionists.personalInfo')}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">{t('common.fullName')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{detail.fullName}</p>
              </div>
              <div>
                <p className="text-gray-500">{t('admin.receptionists.receptionistCode')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{detail.receptionistCode}</p>
              </div>
              <div>
                <p className="text-gray-500">{t('common.email')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{detail.email}</p>
              </div>
              <div>
                <p className="text-gray-500">{t('common.phone')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{detail.phone || '---'}</p>
              </div>
              <div>
                <p className="text-gray-500">{t('admin.receptionists.registeredDate')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatDateTime(detail.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-500">{t('common.status')}</p>
                <p>{getStatusBadge(detail.status, t)}</p>
              </div>
            </div>
          </div>

          {/* Hospital Information */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              🏥 {t('admin.receptionists.hospitalInfo')}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="col-span-2">
                <p className="text-gray-500">{t('common.hospital')}</p>
                <p className="font-medium">{detail.hospitalName}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">{t('common.address')}</p>
                <p className="font-medium">{detail.hospitalAddress}</p>
              </div>
            </div>
          </div>

          {/* CV Document */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              📎 {t('admin.receptionists.attachments')}
            </h3>
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">CV - {detail.fullName}</p>
                  <p className="text-xs text-gray-500">
                    {detail.cvUrl ? 'PDF' : t('admin.receptionists.noCV')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDownloadCV(detail.cvUrl)}
                disabled={!detail.cvUrl}
                className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
              >
                📥 {t('common.download')}
              </button>
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                📜 {t('admin.receptionists.approvalHistory')}
              </h3>
              <div className="relative">
                {history.map((item, index) => renderHistoryItem(item, index))}
              </div>
            </div>
          )}

          {/* Rejection Reason */}
          {detail.status === ReceptionistStatus.REJECTED && (detail.rejectionReason || detail.rejectionNote) && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
              <h3 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2 flex items-center gap-2">
                ❌ {t('admin.receptionists.rejectionReasonTitle')}
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400">
                {detail.rejectionReason}
                {detail.rejectionNote && ` - ${detail.rejectionNote}`}
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ReceptionistDetailModal;