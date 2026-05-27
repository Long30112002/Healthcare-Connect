import { useAppTranslation } from '../../../../application/hooks/useAppTranslation';
import Modal from '../../../components/shared/Modal';

interface ApproveDoctorModalProps {
  isOpen: boolean;
  doctorName: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const ApproveDoctorModal = ({ isOpen, doctorName, onClose, onConfirm, loading = false }: ApproveDoctorModalProps) => {
  const { t } = useAppTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('admin.doctors.approveTitle')}
      message={t('admin.doctors.approveConfirmMessage', { name: doctorName })}
      variant="primary"
      confirmText={t('common.confirm')}
      cancelText={t('common.cancel')}
      loading={loading}
    />
  );
};

export default ApproveDoctorModal;