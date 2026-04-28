import { t } from 'i18next';
import { useState } from 'react';

interface AISuggestionCardProps {
    onBookSuggestion?: (suggestion: string) => void;
    // Text props
    title?: string;
    symptomLabel?: string;
    symptomPlaceholder?: string;
    analyzeButton?: string;
    analyzingText?: string;
    defaultSuggestion?: string;
    bookNowText?: string;
}

const AISuggestionCard = ({ 
    onBookSuggestion,
    title = 'GỢI Ý TỪ AI',
    symptomLabel = 'Bạn đang gặp triệu chứng gì?',
    symptomPlaceholder = 'VD: đau đầu, sốt, mệt mỏi, ho...',
    analyzeButton = 'Gợi ý',
    analyzingText = 'Đang phân tích...',
    defaultSuggestion = 'Bạn có thể khám tổng quát để kiểm tra sức khỏe định kỳ, phát hiện sớm các vấn đề tiềm ẩn.',
    bookNowText = 'Đặt lịch ngay'
}: AISuggestionCardProps) => {
    const [symptoms, setSymptoms] = useState('');
    const [suggestion, setSuggestion] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGetSuggestion = async () => {
        if (!symptoms.trim()) return;

        setIsLoading(true);
        // TODO: Gọi API AI
        setTimeout(() => {
            setSuggestion(defaultSuggestion);
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🤖</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    🔍 {symptomLabel}
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder={symptomPlaceholder}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <button
                        onClick={handleGetSuggestion}
                        disabled={!symptoms.trim() || isLoading}
                        className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
                    >
                        {isLoading ? analyzingText : analyzeButton}
                    </button>
                </div>
            </div>

            {suggestion && (
                <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="flex items-start gap-2">
                        <span className="text-xl">💡</span>
                        <div>
                            <p className="text-gray-700 dark:text-gray-300">{suggestion}</p>
                            <button
                                onClick={() => onBookSuggestion?.(suggestion)}
                                className="mt-2 text-sm text-primary hover:text-blue-700 font-medium"
                            >
                                {bookNowText} →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!suggestion && !symptoms && (
                <div className="mt-2 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span>🩺 <strong>{t('common.suggestion')}:</strong> {defaultSuggestion}</span>
                    </p>
                    <button
                        onClick={() => onBookSuggestion?.('Khám tổng quát')}
                        className="mt-2 text-sm text-primary hover:text-blue-700 font-medium"
                    >
                        {bookNowText} →
                    </button>
                </div>
            )}
        </div>
    );
};

export default AISuggestionCard;