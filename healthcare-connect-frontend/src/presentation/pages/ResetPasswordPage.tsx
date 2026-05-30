import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppTranslation } from '../../application/hooks/useAppTranslation';
import { useMinLoadingAction } from '../../application/hooks/useMinLoadingAction';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import { authApi } from '../../infrastructure/api/authApi';
import { useSystemConfig } from '../../application/hooks/useSystemConfig';
import { images } from '../../shared/utils/imageUtils';

const ResetPasswordPage = () => {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { configs } = useSystemConfig();
  const systemLogo = configs.SYSTEM_LOGO_URL || images.logo();

  const { execute: resetPassword, loading } = useMinLoadingAction({
    minLoadingTime: 1500,
    successMessage: t('resetPassword.successMessage'),
    errorMessage: t('resetPassword.errorMessage'),
    onSuccess: () => {
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    },
  });

  useEffect(() => {
    if (!code) {
      toast.error(t('resetPassword.invalidCode'));
    }
  }, [code, t]);

  const validateForm = (): boolean => {
    if (!password) {
      toast.error(t('error.PASSWORD_INVALID'));
      return false;
    }
    if (password.length < 8) {
      toast.error(t('error.PASSWORD_INVALID'));
      return false;
    }
    if (password !== confirmPassword) {
      toast.error(t('resetPassword.passwordMismatch'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code) {
      toast.error(t('resetPassword.invalidCode'));
      return;
    }

    if (!validateForm()) return;

    await resetPassword(() => authApi.resetPassword({ code, newPassword: password }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-500 p-4 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }} />
      </div>

      {/* Animated Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-white rounded-full opacity-10 animate-float-slow"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-white rounded-full opacity-10 animate-float-delay"></div>
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-cyan-300 rounded-full opacity-10 animate-float-fast"></div>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-blue-300 rounded-full opacity-10 animate-float-slow"></div>
      </div>

      {/* Medical Icons Floating */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-white opacity-65 text-6xl animate-bounce-slow">🏥</div>
        <div className="absolute bottom-32 right-16 text-white opacity-65 text-6xl animate-pulse-slow">💊</div>
        <div className="absolute top-1/2 right-20 text-white opacity-65 text-6xl animate-spin-slow">🩺</div>
        <div className="absolute bottom-20 left-1/4 text-white opacity-65 text-6xl animate-float-slow">🚑</div>
        <div className="absolute top-40 right-1/3 text-white opacity-65 text-6xl animate-bounce-slow">❤️</div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-2xl mb-4">
            <img
              src={systemLogo}
              alt="Logo"
              className="w-12 h-12 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 animate-slide-up">{t('resetPassword.title')}</h2>
          <p className="text-blue-100 animate-slide-up">{t('resetPassword.subtitle')}</p>
        </div>

        {/* Reset Password Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 animate-fade-in">
          {!code && (
            <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
              <p className="text-yellow-700 text-sm">{t('resetPassword.invalidCode')}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Password Field - Dùng Input component */}
            <Input
              label={t('common.password')}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={!code}
              size="lg"
              rounded="lg"
              icon={
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:opacity-70 transition p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  disabled={!code}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              }
            />

            {/* Confirm Password Field - Dùng Input component */}
            <Input
              label={t('register.confirmPassword')}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={!code}
              size="lg"
              rounded="lg"
              icon={
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="hover:opacity-70 transition p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  disabled={!code}
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              }
            />

            {/* Password hint */}
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
              {t('register.passwordHint')}
            </p>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              rounded="lg"
              fullWidth
              loading={loading}
              disabled={loading || !code}
            >
              {t('resetPassword.submitButton')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <Link to="/login" className="text-primary hover:text-blue-700 font-medium">
                ← {t('common.back')}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-30px) translateX(20px); }
        }
        @keyframes float-delay {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-40px) scale(1.1); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.1); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
        .animate-float-delay { animation: float-delay 8s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
      `}</style>
    </div>
  );
};

export default ResetPasswordPage;