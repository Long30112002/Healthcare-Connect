import React, { type ReactNode } from 'react';
import { useAuth } from '../../../application/context/AuthContext';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import LoadingSpinner from '../../../presentation/components/shared/LoadingSpinner';

interface BaseProfileProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

const BaseProfile: React.FC<BaseProfileProps> = ({ 
  children, 
  title, 
  subtitle 
}) => {
  const { loading } = useAuth();
  const { t } = useAppTranslation();

  if (loading) {
    return <LoadingSpinner fullScreen variant="dots" text={t('common.loading')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">👤</span>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {title || t('profile.title')}
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                {subtitle || t('profile.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 space-y-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseProfile;