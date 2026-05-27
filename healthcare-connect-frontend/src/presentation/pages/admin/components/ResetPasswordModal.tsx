import { useAppTranslation } from '../../../../application/hooks/useAppTranslation';
import Modal from '../../../components/shared/Modal';

interface ResetPasswordModalProps {
  isOpen: boolean;
  userName: string;
  userEmail: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const ResetPasswordModal = ({ isOpen, userName, userEmail, onClose, onConfirm, loading = false }: ResetPasswordModalProps) => {
  const { t } = useAppTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('admin.users.resetTitle')}
      message={t('admin.users.resetConfirmMessage', { name: userName, email: userEmail })}
      variant="warning"
      confirmText={t('common.confirm')}
      cancelText={t('common.cancel')}
      loading={loading}
    />
  );
};

export default ResetPasswordModal;