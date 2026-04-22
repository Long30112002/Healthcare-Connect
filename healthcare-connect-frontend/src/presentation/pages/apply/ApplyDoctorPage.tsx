import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { useAuth } from '../../../application/context/AuthContext';
import { doctorApi } from '../../../infrastructure/api/doctorApi';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import FileUpload from '../../components/shared/FileUpload';
import Select from '../../components/shared/Select';
import toast from 'react-hot-toast';
import type { Hospital } from '../../../core/types';
import { commonApi } from '../../../infrastructure/api/commonApi';
import type { DepartmentResponse, SpecialtyResponse } from '../../../core/types/api.response';

const ApplyDoctorPage = () => {
    const { t } = useAppTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();

    // States
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Data lists
    const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
    const [specialties, setSpecialties] = useState<SpecialtyResponse[]>([]);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [filteredSpecialties, setFilteredSpecialties] = useState<SpecialtyResponse[]>([]);

    // Form data
    const [departmentId, setDepartmentId] = useState('');
    const [specialtyId, setSpecialtyId] = useState('');
    const [degree, setDegree] = useState('');
    const [experienceYears, setExperienceYears] = useState<number>(0);
    const [biography, setBiography] = useState('');
    const [hospitalId, setHospitalId] = useState('');
    const [cvFile, setCvFile] = useState<File | null>(null);

    // Errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch all data when component mounts
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [deptRes, specRes, hospRes] = await Promise.all([
                    commonApi.getDepartments(),
                    commonApi.getSpecialties(),
                    commonApi.getHospitals()
                ]);
                setDepartments(deptRes);
                setSpecialties(specRes);
                setHospitals(hospRes);
            } catch (error) {
                toast.error(t('applyDoctor.loadDataError'));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filter specialties when department changes
    useEffect(() => {
        if (departmentId) {
            const filtered = specialties.filter(spec => spec.department.id === departmentId);
            setFilteredSpecialties(filtered);
            setSpecialtyId('');
        } else {
            setFilteredSpecialties([]);
        }
    }, [departmentId, specialties]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!departmentId) newErrors.departmentId = t('applyDoctor.requiredDepartment');
        if (!specialtyId) newErrors.specialtyId = t('applyDoctor.requiredSpecialty');
        if (!degree.trim()) newErrors.degree = t('applyDoctor.requiredDegree');
        if (experienceYears < 0) newErrors.experienceYears = t('applyDoctor.invalidExperience');
        if (!biography.trim()) newErrors.biography = t('applyDoctor.requiredBiography');
        if (!hospitalId) newErrors.hospitalId = t('applyDoctor.requiredHospital');
        if (!cvFile) newErrors.cvFile = t('applyDoctor.requiredCV');

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSubmitting(true);

        const formData = new FormData();
        formData.append('departmentId', departmentId);
        formData.append('specialtyId', specialtyId);
        formData.append('degree', degree);
        formData.append('experienceYears', experienceYears.toString());
        formData.append('biography', biography);
        formData.append('hospitalId', hospitalId);
        if (cvFile) formData.append('cvFile', cvFile);

        try {
            await doctorApi.applyDoctor(formData);
            toast.success(t('applyDoctor.successMessage'));
            setTimeout(() => {
                navigate('/apply/status');
            }, 2000);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || t('applyDoctor.errorMessage');
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const departmentOptions = departments.map(dept => ({
        value: dept.id,
        label: dept.name
    }));

    const specialtyOptions = filteredSpecialties.map(spec => ({
        value: spec.id,
        label: spec.name
    }));

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
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">👨‍⚕️</span>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{t('applyDoctor.title')}</h1>
                            <p className="text-blue-100 text-sm mt-1">{t('applyDoctor.subtitle')}</p>
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
                                {t('applyDoctor.personalInfo')}
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

                        {/* Thông tin chuyên môn */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                <span className="text-lg">🎓</span>
                                {t('applyDoctor.professionalInfo')}
                            </h3>
                            <div className="space-y-4">
                                <Select
                                    label={t('applyDoctor.department')}
                                    value={departmentId}
                                    onChange={(e) => setDepartmentId(e.target.value)}
                                    options={departmentOptions}
                                    placeholder={t('applyDoctor.selectDepartment')}
                                    required
                                    error={errors.departmentId}
                                />

                                <Select
                                    label={t('applyDoctor.specialty')}
                                    value={specialtyId}
                                    onChange={(e) => setSpecialtyId(e.target.value)}
                                    options={specialtyOptions}
                                    placeholder={t('applyDoctor.selectSpecialty')}
                                    required
                                    disabled={!departmentId}
                                    error={errors.specialtyId}
                                />

                                <Input
                                    label={t('applyDoctor.degree')}
                                    value={degree}
                                    onChange={(e) => setDegree(e.target.value)}
                                    placeholder={t('applyDoctor.degreePlaceholder')}
                                    required
                                    error={errors.degree}
                                />

                                <Input
                                    label={t('applyDoctor.experienceYears')}
                                    type="number"
                                    value={experienceYears.toString()}
                                    onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                                    placeholder={t('applyDoctor.experiencePlaceholder')}
                                    min={0}
                                    error={errors.experienceYears}
                                />

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        {t('applyDoctor.biography')} <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={biography}
                                        onChange={(e) => setBiography(e.target.value)}
                                        rows={4}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${
                                            errors.biography
                                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                                        }`}
                                        placeholder={t('applyDoctor.biographyPlaceholder')}
                                    />
                                    {errors.biography && (
                                        <p className="mt-1 text-sm text-red-500">{errors.biography}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bệnh viện đăng ký */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                <span className="text-lg">🏥</span>
                                {t('applyDoctor.hospitalInfo')}
                            </h3>
                            <Select
                                label={t('applyDoctor.hospital')}
                                value={hospitalId}
                                onChange={(e) => setHospitalId(e.target.value)}
                                options={hospitalOptions}
                                placeholder={t('applyDoctor.selectHospital')}
                                required
                                error={errors.hospitalId}
                            />
                        </div>

                        {/* Tài liệu đính kèm */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                <span className="text-lg">📎</span>
                                {t('applyDoctor.attachments')}
                            </h3>
                            <FileUpload
                                label={t('applyDoctor.cvFile')}
                                accept=".pdf,.doc,.docx"
                                onFileSelect={(file) => setCvFile(file)}
                                error={errors.cvFile}
                                description={t('applyDoctor.cvDescription')}
                            />
                        </div>

                        {/* Lưu ý */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-start gap-2">
                                <span className="text-lg">⚠️</span>
                                <span>{t('applyDoctor.noteContent')}</span>
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(-1)}
                                className="flex-1"
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                loading={submitting}
                                className="flex-1"
                            >
                                {t('applyDoctor.submit')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ApplyDoctorPage;