import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../application/context/AuthContext';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { useMinLoadingAction } from '../../../application/hooks/useMinLoadingAction';
import BaseProfile from './BaseProfile';
import BasicInfoForm from './components/BasicInfoForm';
import ChangePasswordForm from './components/ChangePasswordForm';
import Input from '../../../presentation/components/shared/Input';
import Button from '../../../presentation/components/shared/Button';
import { doctorApi } from '../../../infrastructure/api/doctorApi';
import toast from 'react-hot-toast';
import type { DoctorResponse } from '../../../core/types/api.response';

const DoctorProfile = () => {
    const { user } = useAuth();
    const { t } = useAppTranslation();
    const [doctorInfo, setDoctorInfo] = useState<DoctorResponse | null>(null);
    const [loading, setLoading] = useState(true);

    // Lấy thông tin doctor hiện tại
    useEffect(() => {
        const fetchDoctorInfo = async () => {
            try {
                const data = await doctorApi.getMyInfo();
                setDoctorInfo(data);
            } catch (error) {
                toast.error(t('common.loadError'));
            } finally {
                setLoading(false);
            }
        };
        fetchDoctorInfo();
    }, [t]);

    const { execute: updateDoctor, loading: updating } = useMinLoadingAction({
        minLoadingTime: 800,
        successMessage: t('profile.updateSuccess'),
        errorMessage: (error) => error.response?.data?.message || t('profile.updateError'),
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!doctorInfo) return;

        const updateData = {
            degree: doctorInfo.degree,
            experienceYears: doctorInfo.experienceYears,
            biography: doctorInfo.biography,
            consultationFee: doctorInfo.consultationFee
        };

        await updateDoctor(() => doctorApi.updateMyInfo(updateData));
    };


    const handleChange = (field: keyof DoctorResponse, value: any) => {
        setDoctorInfo(prev => prev ? { ...prev, [field]: value } : null);
    };

    if (loading) {
        return <BaseProfile><div className="text-center py-8">Loading...</div></BaseProfile>;
    }

    return (
        <BaseProfile>
            <BasicInfoForm
                userId={user?.id || ''}
                initialFullName={user?.fullName || ''}
                initialPhone={user?.phone || ''}
                initialEmail={user?.email || ''}
                disabledFields={['email']}
            />

            {/* Doctor-specific info */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                    🩺 {t('profile.doctorInfo')}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label={t('applyDoctor.degree')}
                        value={doctorInfo?.degree || ''}
                        onChange={(e) => handleChange('degree', e.target.value)}
                    />
                    <Input
                        label={t('applyDoctor.experienceYears')}
                        type="number"
                        value={doctorInfo?.experienceYears?.toString() || '0'}
                        onChange={(e) => handleChange('experienceYears', parseInt(e.target.value) || 0)}
                    />
                    <Input
                        label={t('schedule.price')}
                        type="number"
                        value={doctorInfo?.consultationFee?.toString() || '0'}
                        onChange={(e) => handleChange('consultationFee', parseInt(e.target.value) || 0)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('applyDoctor.biography')}
                    </label>
                    <textarea
                        value={doctorInfo?.biography || ''}
                        onChange={(e) => handleChange('biography', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                </div>

                <div className="flex justify-end">
                    <Button type="submit" variant="primary" loading={updating}>
                        💾 {t('common.save')}
                    </Button>
                </div>
            </form>

            <ChangePasswordForm />
        </BaseProfile>
    );
};

export default DoctorProfile;