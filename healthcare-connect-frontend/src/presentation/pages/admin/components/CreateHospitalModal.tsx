import { useState } from 'react';
import { useAppTranslation } from '../../../../application/hooks/useAppTranslation';
import { adminApi } from '../../../../infrastructure/api/adminApi';
import Modal from '../../../components/shared/Modal';
import Input from '../../../components/shared/Input';
import toast from 'react-hot-toast';

interface CreateHospitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  address: string;
  hotline: string;
  email: string;
  website: string;
  description: string;
  imageUrl: string;
  managerEmail: string;
}

const CreateHospitalModal = ({ isOpen, onClose, onSuccess }: CreateHospitalModalProps) => {
  const { t } = useAppTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: '',
    hotline: '',
    email: '',
    website: '',
    description: '',
    imageUrl: '',
    managerEmail: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('admin.hospitals.validation.nameRequired');
    }
    if (!formData.address.trim()) {
      newErrors.address = t('admin.hospitals.validation.addressRequired');
    }
    if (!formData.managerEmail.trim()) {
      newErrors.managerEmail = t('admin.hospitals.validation.managerEmailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.managerEmail)) {
      newErrors.managerEmail = t('admin.hospitals.validation.emailInvalid');
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('admin.hospitals.validation.emailInvalid');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      await adminApi.createHospital(formData);
      toast.success(t('admin.hospitals.createSuccess'));
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('admin.hospitals.createError'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      address: '',
      hotline: '',
      email: '',
      website: '',
      description: '',
      imageUrl: '',
      managerEmail: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleSubmit}
      title={`🏥 ${t('admin.hospitals.addHospital')}`}
      confirmText={t('common.save')}
      cancelText={t('common.cancel')}
      loading={loading}
      size="lg"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('admin.hospitals.name')}
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder={t('admin.hospitals.namePlaceholder')}
            required
            error={errors.name}
          />
          
          <Input
            label={t('admin.hospitals.managerEmail')}
            type="email"
            value={formData.managerEmail}
            onChange={(e) => handleChange('managerEmail', e.target.value)}
            placeholder="manager@hospital.com"
            required
            error={errors.managerEmail}
            icon="📧"
          />
        </div>

        <Input
          label={t('admin.hospitals.address')}
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder={t('admin.hospitals.addressPlaceholder')}
          required
          error={errors.address}
          icon="📍"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('admin.hospitals.phone')}
            value={formData.hotline}
            onChange={(e) => handleChange('hotline', e.target.value)}
            placeholder="028 1234 5678"
            icon="📞"
          />
          
          <Input
            label={t('common.email')}
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="contact@hospital.com"
            error={errors.email}
            icon="✉️"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('admin.hospitals.website')}
            value={formData.website}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="https://hospital.com"
            icon="🌐"
          />
          
          <Input
            label={t('admin.hospitals.imageUrl')}
            value={formData.imageUrl}
            onChange={(e) => handleChange('imageUrl', e.target.value)}
            placeholder="https://example.com/logo.png"
            icon="🖼️"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t('admin.hospitals.description')}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            placeholder={t('admin.hospitals.descriptionPlaceholder')}
          />
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
            <span className="text-lg">💡</span>
            <span>{t('admin.hospitals.note')}</span>
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default CreateHospitalModal;