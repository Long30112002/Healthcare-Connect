import React, { useState} from 'react';
import { useAppTranslation } from '../../../../application/hooks/useAppTranslation';
import { useMinLoadingAction } from '../../../../application/hooks/useMinLoadingAction';
import Button from '../../../components/shared/Button';
import Input from '../../../components/shared/Input';
import { useAuth } from '../../../../application/context/AuthContext';
import { userApi } from '../../../../infrastructure/api/userApi';

interface BasicInfoFormProps {
  userId: string;
  initialFullName: string;
  initialPhone: string;
  initialEmail: string;
  disabledFields?: string[];
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  userId,
  initialFullName,
  initialPhone,
  initialEmail,
  disabledFields = []
}) => {
  const { t } = useAppTranslation();
  const { updateUser } = useAuth();
  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone);

  const { execute: updateProfile, loading } = useMinLoadingAction({
    minLoadingTime: 800,
    successMessage: t('profile.updateSuccess'),
    errorMessage: (error) => error.response?.data?.message || t('profile.updateError'),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(() => userApi.updateProfile(userId, { fullName, phone }));
  };

  const isDisabled = (field: string) => disabledFields.includes(field);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
        {t('profile.basicInfo')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('common.fullName')}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={isDisabled('fullName')}
        />
        <Input
          label={t('common.phone')}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          disabled={isDisabled('phone')}
        />
        <Input
          label={t('common.email')}
          value={initialEmail}
          disabled={true}
          className="bg-gray-100 dark:bg-gray-700"
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" loading={loading}>
          💾 {t('common.save')}
        </Button>
      </div>
    </form>
  );
};

export default BasicInfoForm;