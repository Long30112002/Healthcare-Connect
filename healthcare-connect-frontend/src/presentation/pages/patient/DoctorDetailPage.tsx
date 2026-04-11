import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import useFetch from '../../../application/hooks/useFetch';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Button from '../../components/shared/Button';
import type { DoctorDetail, ScheduleSlot } from '../../../core/types';

const DoctorDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useAppTranslation();
    const [selectedSchedule, setSelectedSchedule] = useState<ScheduleSlot | null>(null);
    const [symptoms, setSymptoms] = useState('');

    const { data: doctor, loading } = useFetch<DoctorDetail>(
        `/patients/doctors/${id}`,
        'GET',
        { immediate: true }
    );

    const handleBookAppointment = () => {
        if (!selectedSchedule) {
            // Hiển thị toast chọn lịch
            return;
        }
        navigate(`/booking/${selectedSchedule.id}`, { state: { symptoms, doctor } });
    };

    if (loading) {
        return <LoadingSpinner size="lg" />; 
    }


    if (!doctor) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <p className="text-gray-500 dark:text-gray-400">{t('common.notFound')}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Doctor Info */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Avatar */}
                            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 flex items-center justify-center text-4xl shadow-md mx-auto md:mx-0">
                                {doctor.avatar ? (
                                    <img src={doctor.avatar} alt={doctor.fullName} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    doctor.fullName.charAt(0)
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{doctor.fullName}</h1>
                                <p className="text-primary font-medium mt-1">{doctor.specialtyName}</p>
                                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                                    <span className="text-yellow-500">⭐</span>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {doctor.rating > 0 ? doctor.rating.toFixed(1) : t('doctor.noRating')}
                                    </span>
                                </div>
                                <div className="mt-4 space-y-2 text-gray-600 dark:text-gray-400">
                                    <p>🏥 {doctor.hospitalName}</p>
                                    <p>📍 {doctor.address}</p>
                                    <p>🎓 {doctor.experienceYears} {t('doctor.yearsExperience')}</p>
                                    <p>📜 {doctor.degree}</p>
                                    <p className="text-xl font-bold text-primary mt-2">
                                        💰 {doctor.consultationFee?.toLocaleString()} VNĐ / {t('doctor.visit')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Biography */}
                        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('doctor.biography')}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{doctor.biography}</p>
                        </div>
                    </div>
                </div>

                {/* Symptoms Input */}
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        {t('booking.symptoms')}
                    </h3>
                    <textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder={t('booking.symptomsPlaceholder')}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* Schedules */}
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {t('booking.selectSchedule')}
                    </h3>

                    {doctor.schedules.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                            {t('booking.noSchedules')}
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {doctor.schedules.map((schedule) => (
                                <button
                                    key={schedule.id}
                                    onClick={() => setSelectedSchedule(schedule)}
                                    className={`p-3 rounded-lg border-2 transition text-left ${selectedSchedule?.id === schedule.id
                                            ? 'border-primary bg-primary/10 dark:bg-primary/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-primary'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                📅 {new Date(schedule.date).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                ⏰ {schedule.startTime} - {schedule.endTime}
                                            </p>
                                        </div>
                                        <p className="text-sm font-semibold text-primary">
                                            {schedule.price.toLocaleString()}đ
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {schedule.maxPatients - schedule.currentBookings} {t('booking.slotsLeft')}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Book Button */}
                <div className="mt-6">
                    <Button
                        onClick={handleBookAppointment}
                        variant="primary"
                        size="lg"
                        fullWidth
                        disabled={!selectedSchedule}
                    >
                        {t('booking.confirmBooking')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DoctorDetailPage;