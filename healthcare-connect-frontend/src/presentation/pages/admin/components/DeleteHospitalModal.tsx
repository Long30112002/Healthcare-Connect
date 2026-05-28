import { useAppTranslation } from '../../../../application/hooks/useAppTranslation';
import Modal from '../../../components/shared/Modal';

interface DeleteHospitalModalProps {
  isOpen: boolean;
  hospitalName: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const DeleteHospitalModal = ({ isOpen, hospitalName, onClose, onConfirm, loading = false }: DeleteHospitalModalProps) => {
  const { t } = useAppTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('admin.hospitals.deleteTitle')}
      message={t('admin.hospitals.deleteConfirmMessage', { name: hospitalName })}
      variant="danger"
      confirmText={t('common.confirm')}
      cancelText={t('common.cancel')}
      loading={loading}
    >
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
        <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-start gap-2">
          <span className="text-lg">⚠️</span>
          <span>{t('admin.hospitals.deleteWarning')}</span>
        </p>
      </div>
    </Modal>
  );
};

export default DeleteHospitalModal;