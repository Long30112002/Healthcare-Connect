import { useState, useRef } from 'react';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';

interface FileUploadProps {
    label: string;
    accept?: string;
    onFileSelect: (file: File | null) => void;
    error?: string;
    description?: string;
    required?: boolean;
}

const FileUpload = ({ label, accept = '.pdf,.doc,.docx', onFileSelect, error, description, required = false }: FileUploadProps) => {
    const { t } = useAppTranslation();
    const [fileName, setFileName] = useState<string>('');
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File | null) => {
        if (file) {
            setFileName(file.name);
            onFileSelect(file);
        } else {
            setFileName('');
            onFileSelect(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div
                className={`border-2 border-dashed rounded-xl p-6 text-center transition ${
                    dragActive
                        ? 'border-primary bg-primary/5'
                        : error
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={handleChange}
                    className="hidden"
                />
                <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">📄</span>
                    {fileName ? (
                        <>
                            <p className="text-sm font-medium text-green-600">{fileName}</p>
                            <button
                                type="button"
                                onClick={() => handleFile(null)}
                                className="text-xs text-red-500 hover:underline"
                            >
                                {t('common.remove')}
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('common.dragDrop')} {t('common.or')}
                            </p>
                            <button
                                type="button"
                                onClick={() => inputRef.current?.click()}
                                className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                {t('common.browseFile')}
                            </button>
                        </>
                    )}
                </div>
            </div>
            {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
};

export default FileUpload;