import React, { useState } from 'react';
import { useAppTranslation } from '../../../../application/hooks/useAppTranslation';
import { useMinLoadingAction } from '../../../../application/hooks/useMinLoadingAction';
import Button from '../../../components/shared/Button';
import Input from '../../../components/shared/Input';
import toast from 'react-hot-toast';
import { userApi } from '../../../../infrastructure/api/userApi';

const ChangePasswordForm = () => {
  const { t } = useAppTranslation();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const validateForm = (): boolean => {
    if (!oldPassword) {
      toast.error(t('profile.requiredOldPassword'));
      return false;
    }
    if (!newPassword) {
      toast.error(t('profile.requiredNewPassword'));
      return false;
    }
    if (newPassword.length < 8) {
      toast.error(t('profile.passwordMinLength'));
      return false;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('profile.passwordMismatch'));
      return false;
    }
    return true;
  };

  const { execute: changePassword, loading } = useMinLoadingAction({
    minLoadingTime: 800,
    successMessage: t('profile.passwordChangeSuccess'),
    errorMessage: (error) => error.response?.data?.message || t('profile.passwordChangeError'),
    onSuccess: () => {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await changePassword(() => userApi.changePassword({ oldPassword, newPassword }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
        🔒 {t('profile.changePassword')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t('profile.oldPassword')}
          type={showOldPassword ? 'text' : 'password'}
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showOldPassword ? '🙈' : '👁️'}
            </button>
          }
        />
        <div></div>
        <Input
          label={t('profile.newPassword')}
          type={showNewPassword ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showNewPassword ? '🙈' : '👁️'}
            </button>
          }
        />
        <Input
          label={t('profile.confirmPassword')}
          type={showNewPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" loading={loading}>
          🔄 {t('profile.updatePassword')}
        </Button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;