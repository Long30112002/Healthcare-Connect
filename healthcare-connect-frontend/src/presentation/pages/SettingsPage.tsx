import { useState } from 'react';
import { useAuth } from '../../application/context/AuthContext';
import { useTheme } from '../../application/context/ThemeContext';
import { useAppTranslation } from '../../application/hooks/useAppTranslation';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import ThemeToggle from '../components/shared/ThemeToggle';
import LanguageToggle from '../components/shared/LanguageToggle';

const SettingsPage = () => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { t, currentLanguage, changeLanguage } = useAppTranslation();

    // State cho form thông tin cá nhân
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [isEditing, setIsEditing] = useState(false);

    // State cho đổi mật khẩu
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // State cho thông báo
    const [emailNotification, setEmailNotification] = useState(true);
    const [appointmentReminder, setAppointmentReminder] = useState(true);

    // State cho kết quả
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleUpdateProfile = async () => {
        setSuccessMessage('');
        setErrorMessage('');
        try {
            // TODO: Gọi API update profile
            // await userApi.updateProfile({ fullName, phone });
            setSuccessMessage('Cập nhật thông tin thành công!');
            setIsEditing(false);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            setErrorMessage('Cập nhật thất bại, vui lòng thử lại!');
        }
    };

    const handleChangePassword = async () => {
        setSuccessMessage('');
        setErrorMessage('');

        if (newPassword !== confirmPassword) {
            setErrorMessage('Mật khẩu mới không khớp!');
            return;
        }

        if (newPassword.length < 8) {
            setErrorMessage('Mật khẩu phải có ít nhất 8 ký tự!');
            return;
        }

        try {
            // TODO: Gọi API change password
            // await userApi.changePassword({ oldPassword, newPassword });
            setSuccessMessage('Đổi mật khẩu thành công!');
            setShowPasswordForm(false);
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            setErrorMessage('Mật khẩu cũ không chính xác!');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                {t('settings.title')}
            </h1>

            {/* Success/Error Messages */}
            {successMessage && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {errorMessage}
                </div>
            )}

            <div className="space-y-6">
                {/* 1. Giao diện & Ngôn ngữ */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        🎨 {t('settings.appearance')}
                    </h2>
                    <div className="space-y-4">
                        {/* Theme */}
                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <p className="font-medium text-gray-700 dark:text-gray-300">{t('settings.theme')}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.themeDescription')}</p>
                            </div>
                            <div className="flex gap-2">
                                <ThemeToggle />
                            </div>
                        </div>

                        {/* Language */}
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="font-medium text-gray-700 dark:text-gray-300">{t('settings.language')}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.languageDescription')}</p>
                            </div>
                            <div className="flex gap-2">
                                <LanguageToggle variant={theme === 'dark' ? 'dark' : 'light'} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Thông tin cá nhân */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            👤 {t('settings.personalInfo')}
                        </h2>
                        {!isEditing && (
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                ✏️ {t('common.edit')}
                            </Button>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="space-y-4">
                            <Input
                                label={t('common.fullName')}
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                            <Input
                                label={t('common.email')}
                                value={user?.email || ''}
                                disabled
                                className="bg-gray-100 dark:bg-gray-700"
                            />
                            <Input
                                label={t('common.phone')}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                            <div className="flex gap-3 pt-2">
                                <Button onClick={handleUpdateProfile}>{t('common.save')}</Button>
                                <Button variant="outline" onClick={() => setIsEditing(false)}>
                                    {t('common.cancel')}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2 text-gray-700 dark:text-gray-300">
                            <p><span className="font-medium">{t('common.fullName')}:</span> {user?.fullName}</p>
                            <p><span className="font-medium">{t('common.email')}:</span> {user?.email}</p>
                            <p><span className="font-medium">{t('common.phone')}:</span> {user?.phone || 'Chưa cập nhật'}</p>
                        </div>
                    )}
                </div>

                {/* 3. Đổi mật khẩu */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            🔒 {t('settings.changePassword')}
                        </h2>
                        {!showPasswordForm && (
                            <Button variant="outline" size="sm" onClick={() => setShowPasswordForm(true)}>
                                {t('settings.change')}
                            </Button>
                        )}
                    </div>

                    {showPasswordForm && (
                        <div className="space-y-4">
                            <Input
                                type="password"
                                label={t('settings.oldPassword')}
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />
                            <Input
                                type="password"
                                label={t('settings.newPassword')}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <Input
                                type="password"
                                label={t('settings.confirmPassword')}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <div className="flex gap-3 pt-2">
                                <Button onClick={handleChangePassword}>{t('settings.updatePassword')}</Button>
                                <Button variant="outline" onClick={() => {
                                    setShowPasswordForm(false);
                                    setOldPassword('');
                                    setNewPassword('');
                                    setConfirmPassword('');
                                }}>
                                    {t('common.cancel')}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. Thông báo */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        🔔 {t('settings.notifications')}
                    </h2>
                    <div className="space-y-3">
                        <label className="flex items-center justify-between cursor-pointer py-2">
                            <div>
                                <p className="font-medium text-gray-700 dark:text-gray-300">{t('settings.emailNotification')}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.emailNotificationDesc')}</p>
                            </div>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={emailNotification}
                                    onChange={(e) => setEmailNotification(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                            </div>
                        </label>
                        <label className="flex items-center justify-between cursor-pointer py-2">
                            <div>
                                <p className="font-medium text-gray-700 dark:text-gray-300">{t('settings.appointmentReminder')}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.appointmentReminderDesc')}</p>
                            </div>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={appointmentReminder}
                                    onChange={(e) => setAppointmentReminder(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;