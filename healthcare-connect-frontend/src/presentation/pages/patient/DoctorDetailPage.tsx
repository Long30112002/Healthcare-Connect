import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { useMinLoadingAction } from '../../../application/hooks/useMinLoadingAction';
import Button from '../../../presentation/components/shared/Button';
import LoadingSpinner from '../../../presentation/components/shared/LoadingSpinner';
import { appointmentApi } from '../../../infrastructure/api/appointmentApi';
import { formatDateTime, formatTimeOnly, formatPrice } from '../../../shared/utils/dateUtils';
import toast from 'react-hot-toast';
import useFetch from '../../../application/hooks/useFetch';
import type { ScheduleSlot, DoctorDetail } from '../../../core/types';
import type { DoctorRatingResponse } from '../../../core/types/api.response';
import { reviewApi } from '../../../infrastructure/api/reviewApi';

const DoctorDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { t } = useAppTranslation();
    
    const [selectedSchedule, setSelectedSchedule] = useState<ScheduleSlot | null>(null);
    const [symptoms, setSymptoms] = useState('');
    const [rating, setRating] = useState<DoctorRatingResponse | null>(null);
    const [ratingLoading, setRatingLoading] = useState(true);

    const { data: doctor, loading } = useFetch<DoctorDetail>(
        `/patients/doctors/${id}`,
        'GET',
        { immediate: true }
    );

    useEffect(() => {
        const fetchRating = async () => {
            if (!id) return;
            setRatingLoading(true);
            try {
                const ratingData = await reviewApi.getDoctorRating(id);
                setRating(ratingData);
            } catch (error) {
                console.error('Failed to fetch rating:', error);
            } finally {
                setRatingLoading(false);
            }
        };
        fetchRating();
    }, [id]);

    const { execute: bookAppointment, loading: bookingLoading } = useMinLoadingAction({
        minLoadingTime: 1500,
        onSuccess: (result) => {
            toast.success(t('booking.successMessage'));
            navigate(`/payment/${result.id}`);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || t('booking.errorMessage'));
        }
    });

    const handleBookAppointment = () => {
        if (!selectedSchedule) {
            toast.error(t('booking.selectScheduleFirst'));
            return;
        }
        bookAppointment(() => appointmentApi.bookAppointment(selectedSchedule.id, symptoms));
    };

    // 🟢 Hiển thị số sao dạng ★
    const renderStars = (ratingValue: number) => {
        const fullStars = Math.floor(ratingValue);
        const hasHalfStar = ratingValue % 1 !== 0;
        const emptyStars = 5 - Math.ceil(ratingValue);

        return (
            <div className="flex items-center gap-0.5">
                {[...Array(fullStars)].map((_, i) => (
                    <span key={`full-${i}`} className="text-yellow-400">★</span>
                ))}
                {hasHalfStar && (
                    <span className="text-yellow-400">½</span>
                )}
                {[...Array(emptyStars)].map((_, i) => (
                    <span key={`empty-${i}`} className="text-gray-300 dark:text-gray-600">☆</span>
                ))}
            </div>
        );
    };

    // 🟢 Hiển thị rating summary
    const renderRatingSummary = () => {
        if (ratingLoading) {
            return (
                <div className="flex items-center gap-2">
                    <div className="w-20 h-5 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                </div>
            );
        }

        if (!rating || rating.totalReviews === 0) {
            return (
                <div className="flex items-center gap-2">
                    <span className="text-gray-400">⭐</span>
                    <span className="text-sm text-gray-500">{t('doctor.noRatingYet')}</span>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                    {renderStars(rating.averageRating)}
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {rating.averageRating.toFixed(1)}/5
                </span>
                <span className="text-sm text-gray-500">
                    ({rating.totalReviews} {t('doctor.reviews')})
                </span>
            </div>
        );
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
                                
                                {/* 🟢 RATING DISPLAY */}
                                <div className="mt-2">
                                    {renderRatingSummary()}
                                </div>

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
                                                📅 {formatDateTime(schedule.date, 'dd/mm/yyyy')}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                ⏰ {formatTimeOnly(schedule.startTime)} - {formatTimeOnly(schedule.endTime)}
                                            </p>
                                        </div>
                                        <p className="text-sm font-semibold text-primary">
                                            {formatPrice(schedule.price)}
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
                        disabled={!selectedSchedule || bookingLoading}
                        loading={bookingLoading}
                    >
                        {t('booking.confirmBooking')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DoctorDetailPage;