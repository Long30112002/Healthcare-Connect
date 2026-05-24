// presentation/pages/ConfirmInvitationPage.tsx

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppTranslation } from '../../application/hooks/useAppTranslation';
import { useMinLoadingAction } from '../../application/hooks/useMinLoadingAction';
import axiosClient from '../../infrastructure/api/axiosClient';
import Button from '../components/shared/Button';

const ConfirmInvitationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useAppTranslation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [hospitalName, setHospitalName] = useState('');

  const token = searchParams.get('token');
  const hospitalId = searchParams.get('hospitalId');

  const { execute: acceptInvitation } = useMinLoadingAction({
    minLoadingTime: 1500,
    onSuccess: (result) => {
      setStatus('success');
      setMessage(result.message);
      setHospitalName(result.user?.pendingInvitation?.hospitalName || '');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    },
    onError: (error) => {
      setStatus('error');
      setMessage(error.response?.data?.message || t('error.UNCATEGORIZED_EXCEPTION'));
    },
  });

  useEffect(() => {
    if (!token || !hospitalId) {
      setStatus('error');
      setMessage(t('confirmInvitation.invalidLink'));
      return;
    }

    acceptInvitation(() => 
      axiosClient.post('/hospitals/accept-invitation', { token, hospitalId })
    );
  }, [token, hospitalId]);

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="fixed inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234299e1' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }} />
        </div>
        <div className="relative z-10 container mx-auto px-4 py-20 max-w-md">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-green-500 to-teal-500"></div>
            <div className="p-8 text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {t('confirmInvitation.successTitle')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {message || t('confirmInvitation.successMessage', { hospitalName })}
              </p>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  🏥 {hospitalName || t('confirmInvitation.hospitalNameDefault')}
                </p>
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                ⏱️ {t('confirmInvitation.redirecting')}
              </p>
              <Button 
                variant="primary" 
                onClick={() => navigate('/login')} 
                className="bg-gradient-to-r from-green-600 to-teal-500 hover:from-green-700 hover:to-teal-600"
              >
                🔑 {t('common.login')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234299e1' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }} />
      </div>
      <div className="relative z-10 container mx-auto px-4 py-20 max-w-md">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-red-500 to-pink-500"></div>
          <div className="p-8 text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
              {t('confirmInvitation.errorTitle')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {message || t('confirmInvitation.errorMessage')}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate('/')}>
                🏠 {t('common.home')}
              </Button>
              <Button variant="primary" onClick={() => window.location.reload()}>
                🔄 {t('common.retry')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmInvitationPage;