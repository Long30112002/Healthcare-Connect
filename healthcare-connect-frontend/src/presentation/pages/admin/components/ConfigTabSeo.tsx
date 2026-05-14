import { useState } from 'react';
import { useAppTranslation } from '../../../../application/hooks/useAppTranslation';
import ConfigField from './ConfigField';
import { configApi } from '../../../../infrastructure/api/configApi';
import toast from 'react-hot-toast';
import type { SystemConfig } from '../../../../core/types';

interface ConfigTabSeoProps {
    configs: SystemConfig[];
    onRefresh: () => void;
}

const ConfigTabSeo = ({ configs, onRefresh }: ConfigTabSeoProps) => {
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
                    🔍 {t('adminConfig.seo.title')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('adminConfig.seo.desc')}
                </p>
            </div>

            <ConfigField
                configKey="SEO_TITLE"
                label={t('adminConfig.seo.pageTitle')}
                type="text"
                value={getConfigValue('SEO_TITLE')}
                placeholder={t('adminConfig.seo.pageTitlePlaceholder')}
                onSave={handleSave}
                saving={savingKey === 'SEO_TITLE'}
            />

            <ConfigField
                configKey="SEO_DESCRIPTION"
                label={t('adminConfig.seo.description')}
                type="textarea"
                value={getConfigValue('SEO_DESCRIPTION')}
                placeholder={t('adminConfig.seo.descriptionPlaceholder')}
                onSave={handleSave}
                saving={savingKey === 'SEO_DESCRIPTION'}
            />

            <ConfigField
                configKey="SEO_KEYWORDS"
                label={t('adminConfig.seo.keywords')}
                type="text"
                value={getConfigValue('SEO_KEYWORDS')}
                placeholder={t('adminConfig.seo.keywordsPlaceholder')}
                onSave={handleSave}
                saving={savingKey === 'SEO_KEYWORDS'}
            />
        </div>
    );
};

export default ConfigTabSeo;