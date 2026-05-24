import { useState } from 'react';
import { useAppTranslation } from '../../../../application/hooks/useAppTranslation';
import ConfigField from './ConfigField';
import { configApi } from '../../../../infrastructure/api/configApi';
import toast from 'react-hot-toast';
import type { SystemConfig } from '../../../../core/types';

interface ConfigTabHomeProps {
    configs: SystemConfig[];
    onRefresh: () => void;
}

const ConfigTabHome = ({ configs, onRefresh }: ConfigTabHomeProps) => {
    const { t } = useAppTranslation();
    const [savingKey, setSavingKey] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);

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

    const handlePreview = (key: string) => {
        const value = getConfigValue(key);
        try {
            const parsed = JSON.parse(value);
            setPreviewData(parsed);
            setShowPreview(true);
            toast.success(t('adminConfig.previewReady'));
        } catch {
            toast.error(t('adminConfig.invalidJson'));
        }
    };

    return (
        <div className="space-y-2">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    🎠 {t('adminConfig.home.heroSlides')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('adminConfig.home.heroSlidesDesc')}
                </p>
            </div>

            {/* Hero Slides - 2 ngôn ngữ */}
            <div className="pl-4 border-l-2 border-blue-300 dark:border-blue-700">
                <ConfigField
                    configKey="HOME_HERO_SLIDES_VI"
                    label={t('adminConfig.home.heroSlidesVI')}
                    type="json"
                    value={getConfigValue('HOME_HERO_SLIDES_VI')}
                    onSave={handleSave}
                    saving={savingKey === 'HOME_HERO_SLIDES_VI'}
                />
                <ConfigField
                    configKey="HOME_HERO_SLIDES_EN"
                    label={t('adminConfig.home.heroSlidesEN')}
                    type="json"
                    value={getConfigValue('HOME_HERO_SLIDES_EN')}
                    onSave={handleSave}
                    saving={savingKey === 'HOME_HERO_SLIDES_EN'}
                />
            </div>

            <div className="mt-8 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    📊 {t('adminConfig.home.features')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('adminConfig.home.featuresDesc')}
                </p>
            </div>

            {/* Features - 2 ngôn ngữ */}
            <div className="pl-4 border-l-2 border-green-300 dark:border-green-700">
                <ConfigField
                    configKey="HOME_FEATURES_VI"
                    label={t('adminConfig.home.featuresVI')}
                    type="json"
                    value={getConfigValue('HOME_FEATURES_VI')}
                    onSave={handleSave}
                    saving={savingKey === 'HOME_FEATURES_VI'}
                />
                <ConfigField
                    configKey="HOME_FEATURES_EN"
                    label={t('adminConfig.home.featuresEN')}
                    type="json"
                    value={getConfigValue('HOME_FEATURES_EN')}
                    onSave={handleSave}
                    saving={savingKey === 'HOME_FEATURES_EN'}
                />
            </div>

            <div className="mt-8 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    📈 {t('adminConfig.home.stats')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('adminConfig.home.statsDesc')}
                </p>
            </div>

            {/* Stats - 2 ngôn ngữ */}
            <div className="pl-4 border-l-2 border-purple-300 dark:border-purple-700">
                <ConfigField
                    configKey="HOME_STATS_VI"
                    label={t('adminConfig.home.statsVI')}
                    type="json"
                    value={getConfigValue('HOME_STATS_VI')}
                    onSave={handleSave}
                    saving={savingKey === 'HOME_STATS_VI'}
                />
                <ConfigField
                    configKey="HOME_STATS_EN"
                    label={t('adminConfig.home.statsEN')}
                    type="json"
                    value={getConfigValue('HOME_STATS_EN')}
                    onSave={handleSave}
                    saving={savingKey === 'HOME_STATS_EN'}
                />
            </div>

            <div className="mt-8 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    🚀 {t('adminConfig.home.cta')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('adminConfig.home.ctaDesc')}
                </p>
            </div>

            {/* CTA - 2 ngôn ngữ */}
            <div className="pl-4 border-l-2 border-orange-300 dark:border-orange-700">
                <ConfigField
                    configKey="HOME_CTA_TITLE_VI"
                    label={t('adminConfig.home.ctaTitleVI')}
                    type="text"
                    value={getConfigValue('HOME_CTA_TITLE_VI')}
                    onSave={handleSave}
                    saving={savingKey === 'HOME_CTA_TITLE_VI'}
                />
                <ConfigField
                    configKey="HOME_CTA_TITLE_EN"
                    label={t('adminConfig.home.ctaTitleEN')}
                    type="text"
                    value={getConfigValue('HOME_CTA_TITLE_EN')}
                    onSave={handleSave}
                    saving={savingKey === 'HOME_CTA_TITLE_EN'}
                />
                <ConfigField
                    configKey="HOME_CTA_SUBTITLE_VI"
                    label={t('adminConfig.home.ctaSubtitleVI')}
                    type="text"
                    value={getConfigValue('HOME_CTA_SUBTITLE_VI')}
                    onSave={handleSave}
                    saving={savingKey === 'HOME_CTA_SUBTITLE_VI'}
                />
                <ConfigField
                    configKey="HOME_CTA_SUBTITLE_EN"
                    label={t('adminConfig.home.ctaSubtitleEN')}
                    type="text"
                    value={getConfigValue('HOME_CTA_SUBTITLE_EN')}
                    onSave={handleSave}
                    saving={savingKey === 'HOME_CTA_SUBTITLE_EN'}
                />
                <ConfigField
                    configKey="HOME_CTA_BUTTON_TEXT_VI"
                    label={t('adminConfig.home.ctaButtonVI')}
                    type="text"
                    value={getConfigValue('HOME_CTA_BUTTON_TEXT_VI')}
                    onSave={handleSave}
                    saving={savingKey === 'HOME_CTA_BUTTON_TEXT_VI'}
                />
                <ConfigField
                    configKey="HOME_CTA_BUTTON_TEXT_EN"
                    label={t('adminConfig.home.ctaButtonEN')}
                    type="text"
                    value={getConfigValue('HOME_CTA_BUTTON_TEXT_EN')}
                    onSave={handleSave}
                    saving={savingKey === 'HOME_CTA_BUTTON_TEXT_EN'}
                />
            </div>

            {/* Preview Modal - có thể thêm sau */}
            {showPreview && previewData && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl max-h-[80vh] overflow-auto">
                        <h3 className="text-lg font-bold mb-4">Preview</h3>
                        <pre className="text-sm">{JSON.stringify(previewData, null, 2)}</pre>
                        <button
                            onClick={() => setShowPreview(false)}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                        >
                            Đóng
                        </button>
                        <button
                            onClick={() => handlePreview('HOME_HERO_SLIDES_VI')}
                            className="px-3 py-1 bg-blue-500 text-white rounded"
                        >
                            Preview
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConfigTabHome;