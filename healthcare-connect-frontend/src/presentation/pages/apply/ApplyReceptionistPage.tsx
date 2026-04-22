import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { useAuth } from '../../../application/context/AuthContext';
import { receptionistApi } from '../../../infrastructure/api/receptionistApi';
import Button from '../../components/shared/Button';
import FileUpload from '../../components/shared/FileUpload';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import toast from 'react-hot-toast';
import { commonApi } from '../../../infrastructure/api/commonApi';
import Select from '../../components/shared/Select';
import type { Hospital } from '../../../core/types';

const ApplyReceptionistPage = () => {
    const { t } = useAppTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [hospitalId, setHospitalId] = useState('');
    const [note, setNote] = useState('');
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchHospitals();
    }, []);

    const fetchHospitals = async () => {
        setLoading(true);
        try {
            const response = await commonApi.getHospitals();
            setHospitals(response);
        } catch (error) {
            toast.error(t('applyReceptionist.loadHospitalsError'));
        } finally {
            setLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!hospitalId) newErrors.hospitalId = t('applyReceptionist.requiredHospital');
        if (!cvFile) newErrors.cvFile = t('applyReceptionist.requiredCV');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        const formData = new FormData();
        formData.append('hospitalId', hospitalId);
        if (note) formData.append('note', note);
        if (cvFile) formData.append('cvFile', cvFile);

        try {
            await receptionistApi.applyReceptionist(formData);
            toast.success(t('applyReceptionist.successMessage'));
            setTimeout(() => navigate('/apply/status'), 2000);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || t('applyReceptionist.errorMessage');
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const hospitalOptions = hospitals.map(h => ({
        value: h.id,
        label: `${h.name} - ${h.address}`
    }));

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">👩‍💼</span>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{t('applyReceptionist.title')}</h1>
                            <p className="text-blue-100 text-sm mt-1">{t('applyReceptionist.subtitle')}</p>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Thông tin cá nhân */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                <span className="text-lg">👤</span>
                                {t('applyReceptionist.personalInfo')}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">{t('common.fullName')}</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.fullName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('common.email')}</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('common.phone')}</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.phone}</p>
                                </div>
                            </div>
                        </div>

                        {/* Bệnh viện */}
                        <Select
                            label={t('applyReceptionist.hospital')}
                            value={hospitalId}
                            onChange={(e) => setHospitalId(e.target.value)}
                            options={hospitalOptions}
                            placeholder={t('applyReceptionist.selectHospital')}
                            required
                            error={errors.hospitalId}
                        />

                        {/* CV */}
                        <FileUpload
                            label={t('applyReceptionist.cvFile')}
                            accept=".pdf,.doc,.docx"
                            onFileSelect={(file) => setCvFile(file)}
                            error={errors.cvFile}
                            description={t('applyReceptionist.cvDescription')}
                        />

                        {/* Ghi chú */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                {t('applyReceptionist.note')}
                            </label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800"
                                placeholder={t('applyReceptionist.notePlaceholder')}
                            />
                        </div>

                        {/* Lưu ý */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-start gap-2">
                                <span className="text-lg">⚠️</span>
                                <span>{t('applyReceptionist.note')}</span>
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit" variant="primary" loading={submitting} className="flex-1">
                                {t('applyReceptionist.submit')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ApplyReceptionistPage;