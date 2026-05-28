import { useAppTranslation } from '../../../../application/hooks/useAppTranslation';
import Modal from '../../../components/shared/Modal';

interface ApproveReceptionistModalProps {
  isOpen: boolean;
  receptionistName: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const ApproveReceptionistModal = ({ 
  isOpen, 
  receptionistName, 
  onClose, 
  onConfirm, 
  loading = false 
}: ApproveReceptionistModalProps) => {
  const { t } = useAppTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('admin.receptionists.approveTitle')}
      message={t('admin.receptionists.approveConfirmMessage', { name: receptionistName })}
      variant="primary"
      confirmText={t('common.confirm')}
      cancelText={t('common.cancel')}
      loading={loading}
    />
  );
};

export default ApproveReceptionistModal;