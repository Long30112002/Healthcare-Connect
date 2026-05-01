import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { useMinLoadingAction } from '../../../application/hooks/useMinLoadingAction';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { appointmentApi } from '../../../infrastructure/api/appointmentApi';
import { reviewApi } from '../../../infrastructure/api/reviewApi';
import { formatDateTime, formatPrice } from '../../../shared/utils/dateUtils';
import toast from 'react-hot-toast';
import type { Appointment } from '../../../core/types';

const PatientReviewForm = () => {
    const navigate = useNavigate();
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const { t } = useAppTranslation();
    
    const [loading, setLoading] = useState(true);
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [existingReview, setExistingReview] = useState<any>(null);

    // Kiểm tra đã đánh giá chưa và lấy thông tin appointment
    useEffect(() => {
        const fetchData = async () => {
            if (!appointmentId) {
                toast.error(t('common.invalidData'));
                navigate('/appointments');
                return;
            }

            setLoading(true);
            try {
                // Lấy thông tin appointment
                const apt = await appointmentApi.getAppointmentById(appointmentId);
                setAppointment(apt);

                // Kiểm tra đã đánh giá chưa
                const reviewed = await reviewApi.hasReviewed(appointmentId);
                setHasReviewed(reviewed);
                
                if (reviewed) {
                    // Nếu đã đánh giá, lấy thông tin đánh giá cũ
                    const review = await reviewApi.getReviewByAppointmentId(appointmentId);
                    setExistingReview(review);
                    setRating(review.rating);
                    setComment(review.comment || '');
                    setIsAnonymous(review.isAnonymous);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
                toast.error(t('common.loadError'));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [appointmentId, navigate, t]);

    // Gửi đánh giá
    const { execute: submitReview, loading: submitting } = useMinLoadingAction({
        minLoadingTime: 1000,
        successMessage: hasReviewed ? t('review.updateSuccess') : t('review.submitSuccess'),
        errorMessage: (error) => error.response?.data?.message || t('review.submitError'),
        onSuccess: () => {
            setTimeout(() => {
                navigate('/appointments');
            }, 1500);
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (rating === 0) {
            toast.error(t('review.selectRating'));
            return;
        }

        if (hasReviewed) {
            await submitReview(() => reviewApi.updateReview(existingReview.id, {
                rating,
                comment,
                isAnonymous,
                appointmentId: appointmentId!
            }));
        } else {
            await submitReview(() => reviewApi.createReview({
                appointmentId: appointmentId!,
                rating,
                comment,
                isAnonymous
            }));
        }
    };

    // Hiển thị sao
    const renderStarInput = () => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none transition-transform hover:scale-110"
                    >
                        <span className="text-4xl">
                            {(hoverRating || rating) >= star ? '★' : '☆'}
                        </span>
                    </button>
                ))}
            </div>
        );
    };

    if (loading) {
        return <LoadingSpinner fullScreen variant="dots" text={t('common.loading')} />;
    }

    if (!appointment) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">{t('common.notFound')}</p>
            </div>
        );
    }

    // Kiểm tra có được đánh giá không (chỉ COMPLETED mới được đánh giá)
    if (appointment.status !== 'COMPLETED' && !hasReviewed) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-yellow-600 text-lg mb-4">⚠️ {t('review.cannotReview')}</p>
                    <Button variant="primary" onClick={() => navigate('/appointments')}>
                        {t('common.back')}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-6 max-w-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">⭐</span>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {hasReviewed ? t('review.editTitle') : t('review.title')}
                            </h1>
                            <p className="text-blue-100 text-sm mt-1">
                                {t('review.subtitle')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Appointment Info Card */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden mb-6">
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            {t('review.appointmentInfo')}
                        </h2>
                        <div className="space-y-2 text-gray-600 dark:text-gray-400">
                            <p>👨‍⚕️ {appointment.doctorName}</p>
                            <p>🏥 {appointment.hospitalName}</p>
                            <p>📅 {formatDateTime(appointment.startTime, 'dd/mm/yyyy HH:MM')}</p>
                            <p>💰 {formatPrice(appointment.price)}</p>
                        </div>
                    </div>
                </div>

                {/* Review Form */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Rating */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                {t('review.rating')} <span className="text-red-500">*</span>
                            </label>
                            {renderStarInput()}
                            {rating === 0 && (
                                <p className="mt-1 text-sm text-red-500">{t('review.selectRatingHint')}</p>
                            )}
                        </div>

                        {/* Comment */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                {t('review.comment')}
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder={t('review.commentPlaceholder')}
                            />
                        </div>

                        {/* Anonymous Option */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="anonymous"
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                className="w-4 h-4 text-primary rounded focus:ring-primary"
                            />
                            <label htmlFor="anonymous" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                {t('review.anonymous')}
                            </label>
                        </div>

                        {/* Note */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-start gap-2">
                                <span className="text-lg">📝</span>
                                <span>{t('review.note')}</span>
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit" variant="primary" loading={submitting} className="flex-1">
                                {hasReviewed ? '✏️ ' : '⭐ '}
                                {hasReviewed ? t('review.update') : t('review.submit')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PatientReviewForm;