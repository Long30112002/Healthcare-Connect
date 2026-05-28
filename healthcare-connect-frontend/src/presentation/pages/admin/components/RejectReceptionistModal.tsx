import { useState } from 'react';
import { useAppTranslation } from '../../../../application/hooks/useAppTranslation';
import Modal from '../../../components/shared/Modal';
import { RejectionReason } from '../../../../core/constants/enums';

interface RejectReceptionistModalProps {
  isOpen: boolean;
  receptionistName: string;
  onClose: () => void;
  onConfirm: (reasonCode: string, note: string) => void;
  loading?: boolean;
}

const RejectReceptionistModal = ({ 
  isOpen, 
  receptionistName, 
  onClose, 
  onConfirm, 
  loading = false 
}: RejectReceptionistModalProps) => {
  const { t } = useAppTranslation();
  const [rejectReason, setRejectReason] = useState<RejectionReason>(RejectionReason.OTHER);
  const [rejectNote, setRejectNote] = useState('');

  const handleConfirm = () => {
    onConfirm(rejectReason, rejectNote);
  };

  const handleClose = () => {
    setRejectReason(RejectionReason.OTHER);
    setRejectNote('');
    onClose();
  };

  const reasonOptions = [
    { value: RejectionReason.INVALID_CERTIFICATE, label: t('rejectionReason.invalidCertificate'), icon: '📜' },
    { value: RejectionReason.MISSING_DOCUMENTS, label: t('rejectionReason.missingDocuments'), icon: '📄' },
    { value: RejectionReason.INSUFFICIENT_EXPERIENCE, label: t('rejectionReason.insufficientExperience'), icon: '⏳' },
    { value: RejectionReason.PROFILE_MISMATCH, label: t('rejectionReason.profileMismatch'), icon: '⚠️' },
    { value: RejectionReason.OTHER, label: t('rejectionReason.other'), icon: '📝' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={t('admin.receptionists.rejectTitle')}
      variant="danger"
      confirmText={t('common.confirm')}
      cancelText={t('common.cancel')}
      loading={loading}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('admin.receptionists.rejectConfirmMessage', { name: receptionistName })}
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('admin.receptionists.rejectReason')} <span className="text-red-500">*</span>
          </label>
          <select
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value as RejectionReason)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            {reasonOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.icon} {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('admin.receptionists.rejectNote')} <span className="text-gray-400 text-xs">({t('common.optional')})</span>
          </label>
          <textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            placeholder={t('admin.receptionists.rejectNotePlaceholder')}
          />
          <p className="text-xs text-gray-400 mt-1">
            {t('admin.receptionists.rejectNoteHint')}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default RejectReceptionistModal;