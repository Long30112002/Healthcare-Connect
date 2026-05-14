import { useState } from 'react';
import { useAppTranslation } from '../../../../application/hooks/useAppTranslation';
import ConfigField from './ConfigField';
import { configApi, } from '../../../../infrastructure/api/configApi';
import toast from 'react-hot-toast';
import type { SystemConfig } from '../../../../core/types';

interface ConfigTabGeneralProps {
    configs: SystemConfig[];
    onRefresh: () => void;
}

const ConfigTabGeneral = ({ configs, onRefresh }: ConfigTabGeneralProps) => {
    const { t } = useAppTranslation();
    const [savingKey, setSavingKey] = useState<string | null>(null);

    // Lấy config theo key
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
                    🏥 {t('adminConfig.general.basicInfo')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('adminConfig.general.basicInfoDesc')}
                </p>
            </div>

            <ConfigField
                configKey="SYSTEM_NAME"
                label={t('adminConfig.general.systemName')}
                type="text"
                value={getConfigValue('SYSTEM_NAME')}
                placeholder="Healthcare Connect"
                onSave={handleSave}
                saving={savingKey === 'SYSTEM_NAME'}
            />

            <ConfigField
                configKey="SYSTEM_LOGO_URL"
                label={t('adminConfig.general.systemLogo')}
                type="image"
                value={getConfigValue('SYSTEM_LOGO_URL')}
                placeholder="/images/logo.png"
                onSave={handleSave}
                saving={savingKey === 'SYSTEM_LOGO_URL'}
            />

            <div className="mt-8 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    🎨 {t('adminConfig.general.appearance')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('adminConfig.general.appearanceDesc')}
                </p>
            </div>

            <ConfigField
                configKey="HOME_PRIMARY_COLOR"
                label={t('adminConfig.general.primaryColor')}
                type="color"
                value={getConfigValue('HOME_PRIMARY_COLOR') || '#2563eb'}
                placeholder="#2563eb"
                onSave={handleSave}
                saving={savingKey === 'HOME_PRIMARY_COLOR'}
            />

            <ConfigField
                configKey="HOME_SECONDARY_COLOR"
                label={t('adminConfig.general.secondaryColor')}
                type="color"
                value={getConfigValue('HOME_SECONDARY_COLOR') || '#06b6d4'}
                placeholder="#06b6d4"
                onSave={handleSave}
                saving={savingKey === 'HOME_SECONDARY_COLOR'}
            />
        </div>
    );
};

export default ConfigTabGeneral;