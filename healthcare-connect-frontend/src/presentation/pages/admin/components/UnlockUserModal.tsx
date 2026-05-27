import { useAppTranslation } from '../../../../application/hooks/useAppTranslation';
import Modal from '../../../components/shared/Modal';

interface UnlockUserModalProps {
  isOpen: boolean;
  userName: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const UnlockUserModal = ({ isOpen, userName, onClose, onConfirm, loading = false }: UnlockUserModalProps) => {
  const { t } = useAppTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('admin.users.unlockTitle')}
      message={t('admin.users.unlockConfirmMessage', { name: userName })}
      variant="primary"
      confirmText={t('common.confirm')}
      cancelText={t('common.cancel')}
      loading={loading}
    />
  );
};

export default UnlockUserModal;