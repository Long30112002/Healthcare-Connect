import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppTranslation } from '../../application/hooks/useAppTranslation';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import { authApi } from '../../infrastructure/api/authApi';
import { useMinLoadingAction } from '../../application/hooks/useMinLoadingAction';

const ForgotPasswordPage = () => {
  const { t, getError } = useAppTranslation();
  const [email, setEmail] = useState('');

  const { execute: sendResetLink, loading } = useMinLoadingAction({
    minLoadingTime: 1500,
    successMessage: t('forgotPassword.successMessage'),
    errorMessage: (error) => { 
      const errorKey = error.response?.data?.errorKey;
      if (errorKey) {
        return getError(errorKey);
      }
      return error.response?.data?.message || t('forgotPassword.errorMessage');
    },
    onSuccess: () => setEmail(''),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error(t('error.EMAIL_REQUIRED'));
      return;
    }

    await sendResetLink(() => authApi.forgotPassword(email));
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
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-2xl mb-4">
            <img
              src="/src/presentation/assets/images/hospital_logo.png"
              alt="Logo"
              className="w-12 h-12 object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 animate-slide-up">{t('forgotPassword.title')}</h2>
          <p className="text-blue-100 animate-slide-up">{t('forgotPassword.subtitle')}</p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label={t('common.email')}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              // required
              size="lg"
              rounded="lg"
              icon={
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              rounded="lg"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              {t('forgotPassword.sendButton')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
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

export default ForgotPasswordPage;