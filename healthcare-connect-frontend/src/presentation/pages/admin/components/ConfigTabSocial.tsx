import { useState } from 'react';
import { useAppTranslation } from '../../../../application/hooks/useAppTranslation';
import ConfigField from './ConfigField';
import { configApi } from '../../../../infrastructure/api/configApi';
import toast from 'react-hot-toast';
import tiktok from '../../../assets/images/tik-tok.png';
import zalo from '../../../assets/images/zalo.png';
import youtube from '../../../assets/images/youtube.png';
import facebook from '../../../assets/images/facebook.png';
import type { SystemConfig } from '../../../../core/types';

interface ConfigTabSocialProps {
    configs: SystemConfig[];
    onRefresh: () => void;
}

const ConfigTabSocial = ({ configs, onRefresh }: ConfigTabSocialProps) => {
    const { t } = useAppTranslation();
    const [savingKey, setSavingKey] = useState<string | null>(null);

    const getConfigValue = (key: string) => {
        return configs.find(c => c.configKey === key)?.configValue || '';
    };

    const handleSave = async (key: string, value: string) => {
        setSavingKey(key);
        try {
            await configApi.updateConfig(key, value);
            toast.success(t('adminConfig.saveSuccess'));
            onRefresh();
        } catch (error) {
            toast.error(t('adminConfig.saveError'));
        } finally {
            setSavingKey(null);
        }
    };

    const socialLinks = [
        { key: 'SOCIAL_FACEBOOK', label: 'Facebook', icon: facebook, placeholder: 'https://facebook.com/...' },
        { key: 'SOCIAL_ZALO', label: 'Zalo', icon: zalo, placeholder: 'https://zalo.me/...' },
        { key: 'SOCIAL_YOUTUBE', label: 'YouTube', icon: youtube, placeholder: 'https://youtube.com/...' },
        { key: 'SOCIAL_TIKTOK', label: 'TikTok', icon: tiktok, placeholder: 'https://tiktok.com/@...' },
    ];

    return (
        <div className="space-y-2">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    📱 {t('adminConfig.social.title')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('adminConfig.social.desc')}
                </p>
            </div>

            {socialLinks.map((social) => (
                <div key={social.key} className="flex items-start gap-3">
                    {/* Thay vì {social.icon} trực tiếp, dùng img */}
                    <div className="w-8 h-8 flex items-center justify-center">
                        <img 
                            src={social.icon} 
                            alt={social.label}
                            className="w-6 h-6 object-contain"
                        />
                    </div>
                    <div className="flex-1">
                        <ConfigField
                            configKey={social.key}
                            label={social.label}
                            type="text"
                            value={getConfigValue(social.key)}
                            placeholder={social.placeholder}
                            onSave={handleSave}
                            saving={savingKey === social.key}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ConfigTabSocial;