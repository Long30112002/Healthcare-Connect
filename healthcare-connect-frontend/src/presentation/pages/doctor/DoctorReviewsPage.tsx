import { useState, useEffect } from 'react';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import LoadingSpinner from '../../../presentation/components/shared/LoadingSpinner';
import EmptyState from '../../../presentation/components/shared/EmptyState';
import Pagination from '../../../presentation/components/shared/Pagination';
import { formatDateTime } from '../../../shared/utils/dateUtils';
import type { DoctorRatingResponse, DoctorReviewResponse, PageResponse } from '../../../core/types/api.response';
import useFetch from '../../../application/hooks/useFetch';
import { reviewApi } from '../../../infrastructure/api/reviewApi';

const DoctorReviewsPage = () => {
    const { t, currentLanguage } = useAppTranslation();
    const [currentPage, setCurrentPage] = useState(1);
    const [rating, setRating] = useState<DoctorRatingResponse | null>(null);
    const pageSize = 10;

    // Lấy danh sách đánh giá
    const url = `/reviews/doctor/my-reviews?page=${currentPage - 1}&size=${pageSize}`;
    const { data, loading, error, refetch } = useFetch<PageResponse<DoctorReviewResponse>>(
        url,
        'GET',
        {
            immediate: true,
            deps: [currentPage]
        }
    );

    // Lấy rating tổng hợp
    useEffect(() => {
        const fetchRating = async () => {
            try {
                const ratingData = await reviewApi.getMyRating();
                setRating(ratingData);
            } catch (err) {
                console.error('Failed to fetch rating:', err);
            }
        };
        fetchRating();
    }, []);

    const reviews = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;
    const totalElements = data?.totalElements ?? 0;

    // Hiển thị số sao dạng ★
    const renderStars = (ratingValue: number) => {
        const fullStars = Math.floor(ratingValue);
        const hasHalfStar = ratingValue % 1 !== 0;
        const emptyStars = 5 - Math.ceil(ratingValue);

        return (
            <div className="flex items-center gap-0.5">
                {[...Array(fullStars)].map((_, i) => (
                    <span key={`full-${i}`} className="text-yellow-400 text-lg">★</span>
                ))}
                {hasHalfStar && (
                    <span className="text-yellow-400 text-lg">½</span>
                )}
                {[...Array(emptyStars)].map((_, i) => (
                    <span key={`empty-${i}`} className="text-gray-300 dark:text-gray-600 text-lg">☆</span>
                ))}
            </div>
        );
    };

    // Hiển thị rating trung bình dạng số
    const renderAverageRating = () => {
        if (!rating || rating.totalReviews === 0) {
            return (
                <div className="text-center">
                    <div className="text-5xl font-bold text-gray-400">—</div>
                    <div className="text-sm text-gray-500 mt-1">{t('doctorReviews.noReviewsYet')}</div>
                </div>
            );
        }

        return (
            <div className="text-center">
                <div className="text-5xl font-bold text-primary">{rating.averageRating.toFixed(1)}</div>
                <div className="flex justify-center mt-2">
                    {renderStars(rating.averageRating)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                    {t('doctorReviews.totalReviews', { count: rating.totalReviews })}
                </div>
            </div>
        );
    };

    // Hiển thị phân bố số sao
    const renderRatingDistribution = () => {
        if (!rating || rating.totalReviews === 0) return null;

        const maxCount = Math.max(rating.rating5Count, rating.rating4Count, rating.rating3Count, rating.rating2Count, rating.rating1Count);
        
        const bars = [
            { stars: 5, count: rating.rating5Count, label: '5 ★' },
            { stars: 4, count: rating.rating4Count, label: '4 ★' },
            { stars: 3, count: rating.rating3Count, label: '3 ★' },
            { stars: 2, count: rating.rating2Count, label: '2 ★' },
            { stars: 1, count: rating.rating1Count, label: '1 ★' },
        ];

        return (
            <div className="space-y-2">
                {bars.map((bar) => (
                    <div key={bar.stars} className="flex items-center gap-2">
                        <div className="w-12 text-sm text-gray-600 dark:text-gray-400">{bar.label}</div>
                        <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                                style={{ width: `${maxCount > 0 ? (bar.count / maxCount) * 100 : 0}%` }}
                            />
                        </div>
                        <div className="w-12 text-sm text-gray-600 dark:text-gray-400 text-right">{bar.count}</div>
                    </div>
                ))}
            </div>
        );
    };

    if (loading && currentPage === 1) {
        return <LoadingSpinner fullScreen variant="dots" text={t('common.loading')} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">⭐</span>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {t('doctorReviews.title')}
                            </h1>
                            <p className="text-blue-100 text-sm mt-1">
                                {t('doctorReviews.subtitle')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Rating Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Average Rating Card */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            {t('doctorReviews.averageRating')}
                        </h2>
                        {renderAverageRating()}
                    </div>

                    {/* Rating Distribution Card */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            {t('doctorReviews.ratingDistribution')}
                        </h2>
                        {renderRatingDistribution()}
                    </div>
                </div>

                {/* Reviews List */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-900 dark:text-white">
                        {t('doctorReviews.reviewsList')} ({totalElements})
                    </div>

                    <div className="p-4">
                        {error && (
                            <div className="text-center py-8">
                                <p className="text-red-500 dark:text-red-400">{error}</p>
                                <button onClick={() => refetch()} className="mt-2 text-primary hover:underline">
                                    {t('common.retry')}
                                </button>
                            </div>
                        )}

                        {!error && reviews.length === 0 && (
                            <EmptyState
                                title={t('doctorReviews.noReviews')}
                                description={t('doctorReviews.noReviewsDesc')}
                                icon="⭐"
                            />
                        )}

                        {reviews.length > 0 && (
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <div key={review.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                        <div className="flex justify-between items-start flex-wrap gap-2">
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        {review.patientName}
                                                    </span>
                                                    {renderStars(review.rating)}
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    📅 {formatDateTime(review.createdAt, 'dd/mm/yyyy HH:MM')}
                                                </p>
                                            </div>
                                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                📋 {t('doctorReviews.appointment')}: {review.appointmentId.substring(0, 8)}
                                            </span>
                                        </div>

                                        {review.comment && (
                                            <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                                                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                                                    "{review.comment}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-6">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                    showJumpToPage={true}
                                    showFirstLast={true}
                                    showPrevNext={true}
                                    size="md"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorReviewsPage;