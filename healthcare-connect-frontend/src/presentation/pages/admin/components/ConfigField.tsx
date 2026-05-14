import { useState, useEffect } from 'react';
import { useAppTranslation } from '../../../../application/hooks/useAppTranslation';
import Input from '../../../components/shared/Input';
import Button from '../../../components/shared/Button';
import toast from 'react-hot-toast';

interface ConfigFieldProps {
    configKey: string;
    label: string;
    type?: 'text' | 'image' | 'color' | 'json' | 'textarea';
    value: string;
    placeholder?: string;
    onSave: (key: string, value: string) => Promise<void>;
    saving?: boolean;
    readOnly?: boolean;
}

const ConfigField = ({
    configKey,
    label,
    type = 'text',
    value,
    placeholder,
    onSave,
    saving = false,
    readOnly = false
}: ConfigFieldProps) => {
    const { t } = useAppTranslation();
    const [localValue, setLocalValue] = useState(value);
    const [isDirty, setIsDirty] = useState(false);
    const [isValidJson, setIsValidJson] = useState(true);
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    useEffect(() => {
        setLocalValue(value);
        setIsDirty(false);
    }, [value]);

    const handleChange = (newValue: string) => {
        setLocalValue(newValue);
        setIsDirty(true);
        
        if (type === 'json') {
            try {
                JSON.parse(newValue);
                setIsValidJson(true);
            } catch {
                setIsValidJson(false);
            }
        }
    };

    const handleSave = async () => {
        if (type === 'json' && !isValidJson) {
            toast.error(t('adminConfig.invalidJson'));
            return;
        }
        
        await onSave(configKey, localValue);
        setIsDirty(false);
        setLastSaved(new Date().toLocaleTimeString());
    };

    const renderInput = () => {
        switch (type) {
            case 'textarea':
                return (
                    <textarea
                        value={localValue}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder={placeholder}
                        rows={4}
                        disabled={readOnly}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white resize-none"
                    />
                );
            case 'color':
                return (
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={localValue}
                            onChange={(e) => handleChange(e.target.value)}
                            disabled={readOnly}
                            className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                        <input
                            type="text"
                            value={localValue}
                            onChange={(e) => handleChange(e.target.value)}
                            placeholder={placeholder}
                            disabled={readOnly}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                );
            case 'json':
                return (
                    <div className="space-y-2">
                        <textarea
                            value={localValue}
                            onChange={(e) => handleChange(e.target.value)}
                            placeholder={placeholder}
                            rows={8}
                            disabled={readOnly}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white font-mono text-sm ${
                                !isValidJson && localValue ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
                            }`}
                        />
                        {!isValidJson && localValue && (
                            <p className="text-sm text-red-500">{t('adminConfig.invalidJson')}</p>
                        )}
                        {isValidJson && localValue && (
                            <p className="text-sm text-green-500">✅ {t('adminConfig.validJson')}</p>
                        )}
                    </div>
                );
            case 'image':
                return (
                    <div className="flex items-start gap-4">
                        {localValue && (
                            <div className="relative group">
                                <img
                                    src={localValue}
                                    alt={label}
                                    className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=No+Image';
                                    }}
                                />
                            </div>
                        )}
                        <input
                            type="text"
                            value={localValue}
                            onChange={(e) => handleChange(e.target.value)}
                            placeholder={placeholder || 'https://...'}
                            disabled={readOnly}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                );
            default:
                return (
                    <Input
                        value={localValue}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder={placeholder}
                        disabled={readOnly}
                        fullWidth
                    />
                );
        }
    };

    return (
        <div className="border-b border-gray-200 dark:border-gray-700 last:border-0 py-5">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="md:w-1/3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {label}
                    </label>
                    {lastSaved && (
                        <p className="text-xs text-gray-400 mt-1">
                            {t('adminConfig.lastSaved')}: {lastSaved}
                        </p>
                    )}
                </div>
                <div className="md:w-2/3">
                    <div className="space-y-3">
                        {renderInput()}
                        {!readOnly && isDirty && (
                            <div className="flex justify-end">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleSave}
                                    loading={saving}
                                    disabled={type === 'json' && !isValidJson}
                                >
                                    💾 {t('common.save')}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfigField;