import { useState } from 'react';
import { useAppTranslation } from '../../../../application/hooks/useAppTranslation';
import { configApi } from '../../../../infrastructure/api/configApi';
import toast from 'react-hot-toast';
import ConfigField from './ConfigField';
import type { SystemConfig } from '../../../../core/types';

interface ConfigTabFooterProps {
    configs: SystemConfig[];
    onRefresh: () => void;
}

const ConfigTabFooter = ({ configs, onRefresh }: ConfigTabFooterProps) => {
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
                    📄 {t('adminConfig.footer.title')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('adminConfig.footer.desc')}
                </p>
            </div>

            <ConfigField
                configKey="FOOTER_DESCRIPTION"
                label={t('adminConfig.footer.description')}
                type="textarea"
                value={getConfigValue('FOOTER_DESCRIPTION')}
                placeholder={t('adminConfig.footer.descriptionPlaceholder')}
                onSave={handleSave}
                saving={savingKey === 'FOOTER_DESCRIPTION'}
            />

            <ConfigField
                configKey="FOOTER_COPYRIGHT"
                label={t('adminConfig.footer.copyright')}
                type="text"
                value={getConfigValue('FOOTER_COPYRIGHT')}
                placeholder="© 2025 Healthcare Connect"
                onSave={handleSave}
                saving={savingKey === 'FOOTER_COPYRIGHT'}
            />
        </div>
    );
};

export default ConfigTabFooter;