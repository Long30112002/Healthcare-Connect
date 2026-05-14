import { useState } from 'react';
import { useAppTranslation } from '../../../../application/hooks/useAppTranslation';
import ConfigField from './ConfigField';
import { configApi } from '../../../../infrastructure/api/configApi';
import toast from 'react-hot-toast';
import type { SystemConfig } from '../../../../core/types';

interface ConfigTabContactProps {
    configs: SystemConfig[];
    onRefresh: () => void;
}

const ConfigTabContact = ({ configs, onRefresh }: ConfigTabContactProps) => {
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

    return (
        <div className="space-y-2">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    📞 {t('adminConfig.contact.title')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('adminConfig.contact.desc')}
                </p>
            </div>

            <ConfigField
                configKey="CONTACT_PHONE"
                label={t('adminConfig.contact.phone')}
                type="text"
                value={getConfigValue('CONTACT_PHONE')}
                placeholder="1900 1234"
                onSave={handleSave}
                saving={savingKey === 'CONTACT_PHONE'}
            />

            <ConfigField
                configKey="CONTACT_EMAIL"
                label={t('adminConfig.contact.email')}
                type="text"
                value={getConfigValue('CONTACT_EMAIL')}
                placeholder="support@healthcareconnect.vn"
                onSave={handleSave}
                saving={savingKey === 'CONTACT_EMAIL'}
            />

            <ConfigField
                configKey="CONTACT_ADDRESS"
                label={t('adminConfig.contact.address')}
                type="textarea"
                value={getConfigValue('CONTACT_ADDRESS')}
                placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM"
                onSave={handleSave}
                saving={savingKey === 'CONTACT_ADDRESS'}
            />

            <ConfigField
                configKey="CONTACT_MAP_EMBED"
                label={t('adminConfig.contact.mapEmbed')}
                type="textarea"
                value={getConfigValue('CONTACT_MAP_EMBED')}
                placeholder="<iframe src='https://...'></iframe>"
                onSave={handleSave}
                saving={savingKey === 'CONTACT_MAP_EMBED'}
            />
        </div>
    );
};

export default ConfigTabContact;