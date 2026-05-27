import { useState } from 'react';
import { useAppTranslation } from '../../../../application/hooks/useAppTranslation';
import Modal from '../../../components/shared/Modal';
interface LockUserModalProps {
  isOpen: boolean;
  userName: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
}

const LockUserModal = ({ isOpen, userName, onClose, onConfirm, loading = false }: LockUserModalProps) => {
  const { t } = useAppTranslation();
  const [lockReason, setLockReason] = useState('');

  const handleConfirm = () => {
    onConfirm(lockReason);
  };

  const handleClose = () => {
    setLockReason('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={t('admin.users.lockTitle')}
      variant="danger"
      confirmText={t('common.confirm')}
      cancelText={t('common.cancel')}
      loading={loading}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('admin.users.lockConfirmMessage', { name: userName })}
        </p>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('admin.users.lockReason')} <span className="text-gray-400 text-xs">({t('common.optional')})</span>
          </label>
          <textarea
            value={lockReason}
            onChange={(e) => setLockReason(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            placeholder={t('admin.users.lockReasonPlaceholder')}
          />
          <p className="text-xs text-gray-400 mt-1">
            {t('admin.users.lockReasonHint')}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default LockUserModal;