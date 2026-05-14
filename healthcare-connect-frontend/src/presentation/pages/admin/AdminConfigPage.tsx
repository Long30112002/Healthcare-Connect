import { useState, useEffect } from 'react';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { useTabWithUrl } from '../../../application/hooks/useTabWithUrl';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Button from '../../components/shared/Button';
import { configApi } from '../../../infrastructure/api/configApi';
import toast from 'react-hot-toast';
import ConfigTabGeneral from './components/ConfigTabGeneral';
import ConfigTabHome from './components/ConfigTabHome';
import ConfigTabContact from './components/ConfigTabContact';
import ConfigTabSocial from './components/ConfigTabSocial';
import ConfigTabFooter from './components/ConfigTabFooter';
import ConfigTabSeo from './components/ConfigTabSeo';
import type { SystemConfig } from '../../../core/types';

type TabType = 'general' | 'home' | 'contact' | 'social' | 'footer' | 'seo';

const AdminConfigPage = () => {
    const { t } = useAppTranslation();
    const [configs, setConfigs] = useState<SystemConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [resetting, setResetting] = useState(false);

    const { activeTab, setActiveTab } = useTabWithUrl<TabType>({
        paramName: 'tab',
        validValues: ['general', 'home', 'contact', 'social', 'footer', 'seo'],
        defaultValue: 'general',
        includePage: false,
    });

    const tabs = [
        { key: 'general', label: t('adminConfig.tabs.general'), icon: '⚙️' },
        { key: 'home', label: t('adminConfig.tabs.home'), icon: '🏠' },
        { key: 'contact', label: t('adminConfig.tabs.contact'), icon: '📞' },
        { key: 'social', label: t('adminConfig.tabs.social'), icon: '📱' },
        { key: 'footer', label: t('adminConfig.tabs.footer'), icon: '📄' },
        { key: 'seo', label: t('adminConfig.tabs.seo'), icon: '🔍' },
    ];

    const fetchConfigs = async () => {
        setLoading(true);
        try {
            const data = await configApi.getAllConfigsForAdmin();
            setConfigs(data);
        } catch (error) {
            toast.error(t('common.loadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    const handleResetDefault = async () => {
        if (!confirm(t('adminConfig.resetConfirm'))) return;
        
        setResetting(true);
        try {
            // TODO: Gọi API reset về mặc định
            toast.success(t('adminConfig.resetSuccess'));
            await fetchConfigs();
        } catch (error) {
            toast.error(t('adminConfig.resetError'));
        } finally {
            setResetting(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen variant="dots" text={t('common.loading')} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-6 max-w-6xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl p-6 mb-6">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl">⚙️</span>
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    {t('adminConfig.title')}
                                </h1>
                                <p className="text-blue-100 text-sm mt-1">
                                    {t('adminConfig.subtitle')}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleResetDefault}
                            loading={resetting}
                            className="bg-white/20 text-white hover:bg-white/30"
                        >
                            🔄 {t('adminConfig.resetDefault')}
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-2 mb-6 overflow-x-auto">
                    <div className="flex gap-2 min-w-max">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as TabType)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                    activeTab === tab.key
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6">
                        {activeTab === 'general' && (
                            <ConfigTabGeneral configs={configs} onRefresh={fetchConfigs} />
                        )}
                        {activeTab === 'home' && (
                            <ConfigTabHome configs={configs} onRefresh={fetchConfigs} />
                        )}
                        {activeTab === 'contact' && (
                            <ConfigTabContact configs={configs} onRefresh={fetchConfigs} />
                        )}
                        {activeTab === 'social' && (
                            <ConfigTabSocial configs={configs} onRefresh={fetchConfigs} />
                        )}
                        {activeTab === 'footer' && (
                            <ConfigTabFooter configs={configs} onRefresh={fetchConfigs} />
                        )}
                        {activeTab === 'seo' && (
                            <ConfigTabSeo configs={configs} onRefresh={fetchConfigs} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminConfigPage;