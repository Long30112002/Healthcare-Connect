import { useAppTranslation } from '../../../application/hooks/useAppTranslation';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;  
    options: SelectOption[];
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    className?: string;
}

const Select = ({
    label,
    value,
    onChange,
    options,
    placeholder = 'Chọn...',
    required = false,
    disabled = false,
    error,
    className = ''
}: SelectProps) => {
    const { t } = useAppTranslation();

    return (
        <div className={className}>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${
                    error
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
};

export default Select;