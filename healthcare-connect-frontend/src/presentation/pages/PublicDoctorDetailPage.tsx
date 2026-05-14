import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppTranslation } from '../../application/hooks/useAppTranslation';
import type { PublicDoctorDetailResponse } from '../../core/types/api.response';
import { publicDoctorApi } from '../../infrastructure/api/publicDoctorApi';
import { formatDateTime, formatPrice } from '../../shared/utils/dateUtils';
import LoadingSpinner from '../components/shared/LoadingSpinner';


const PublicDoctorDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useAppTranslation();
    
    const [doctor, setDoctor] = useState<PublicDoctorDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchDoctor = async () => {
            if (!id) {
                navigate('/doctors/public');
                return;
            }
            
            setLoading(true);
            try {
                const data = await publicDoctorApi.getDoctorDetail(id);
                setDoctor(data);
            } catch (error) {
                console.error('Failed to fetch doctor detail:', error);
                navigate('/doctors/public');
            } finally {
                setLoading(false);
            }
        };
        
        fetchDoctor();
    }, [id, navigate]);
    
    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - Math.ceil(rating);
        
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
    
    if (loading) {
        return <LoadingSpinner fullScreen variant="dots" text={t('common.loading')} />;
    }
    
    if (!doctor) {
        return null;
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-6 max-w-5xl">
                {/* Back button */}
               
                
                {/* Doctor Info Card - Redesigned */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
                    {/* Header gradient */}
                    <div className="h-32 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500"></div>
                    
                    <div className="relative px-6 pb-6">
                        {/* Avatar - overlapping header */}
                        <div className="relative -mt-16 mb-4">
                            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-5xl shadow-xl border-4 border-white dark:border-gray-800">
                                {doctor.fullName?.charAt(0) || '👨‍⚕️'}
                            </div>
                        </div>
                        
                        {/* Doctor name & rating */}
                        <div className="flex flex-wrap justify-between items-start gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                    {doctor.fullName}
                                </h1>
                                <div className="flex items-center gap-2 mt-2">
                                    {renderStars(doctor.averageRating)}
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        ({doctor.totalReviews} {t('doctor.reviews')})
                                    </span>
                                </div>
                            </div>
                            <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                                <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                    {doctor.specialtyName}
                                </span>
                            </div>
                        </div>
                        
                        {/* Info grid - 2 columns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                    <span className="text-xl">🏥</span>
                                    <div>
                                        <p className="text-sm text-gray-400 dark:text-gray-500">{t('doctor.hospital')}</p>
                                        <p className="font-medium">{doctor.hospitalName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                    <span className="text-xl">📍</span>
                                    <div>
                                        <p className="text-sm text-gray-400 dark:text-gray-500">{t('doctor.address')}</p>
                                        <p className="font-medium">{doctor.hospitalAddress}</p>
                                    </div>
                                </div>
                                {doctor.hospitalPhone && (
                                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                        <span className="text-xl">📞</span>
                                        <div>
                                            <p className="text-sm text-gray-400 dark:text-gray-500">{t('doctor.phone')}</p>
                                            <p className="font-medium">{doctor.hospitalPhone}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                    <span className="text-xl">🎓</span>
                                    <div>
                                        <p className="text-sm text-gray-400 dark:text-gray-500">{t('doctor.experience')}</p>
                                        <p className="font-medium">{doctor.experienceYears} {t('doctor.yearsExperience')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                    <span className="text-xl">📜</span>
                                    <div>
                                        <p className="text-sm text-gray-400 dark:text-gray-500">{t('doctor.degree')}</p>
                                        <p className="font-medium">{doctor.degree}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                    <span className="text-xl">💰</span>
                                    <div>
                                        <p className="text-sm text-gray-400 dark:text-gray-500">{t('schedule.price')}</p>
                                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                            {formatPrice(doctor.consultationFee)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Biography */}
                        {doctor.biography && (
                            <div className="mt-6 p-5 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xl">📝</span>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        {t('doctor.biography')}
                                    </h3>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                    {doctor.biography}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Schedules Section */}
                {doctor.schedules && doctor.schedules.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl">📅</span>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {t('doctor.schedules')}
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {doctor.schedules.map((schedule) => (
                                    <div key={schedule.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">📅</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {formatDateTime(schedule.date, 'dd/mm/yyyy')}
                                                </span>
                                            </div>
                                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                {schedule.currentBookings}/{schedule.maxPatients} {t('schedule.slots')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-2">
                                            <span>⏰</span>
                                            <span>{formatDateTime(schedule.startTime, 'HH:MM')} - {formatDateTime(schedule.endTime, 'HH:MM')}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                            <div className="text-green-600 dark:text-green-400 font-semibold">
                                                {formatPrice(schedule.price)}
                                            </div>
                                            <Link
                                                to={`/login?redirect=/doctors/${doctor.id}/book?scheduleId=${schedule.id}`}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                                            >
                                                🔐 {t('publicDoctors.loginToBook')}
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* No schedules message */}
                {(!doctor.schedules || doctor.schedules.length === 0) && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
                        <div className="p-12 text-center">
                            <div className="text-6xl mb-4">📅</div>
                            <p className="text-gray-500 dark:text-gray-400">{t('doctor.noSchedules')}</p>
                        </div>
                    </div>
                )}
                
                {/* CTA Login - redesigned */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 text-center shadow-xl">
                    <div className="text-4xl mb-3">🔐</div>
                    <h3 className="text-xl font-bold text-white mb-2">
                        {t('publicDoctors.loginToBookTitle')}
                    </h3>
                    <p className="text-blue-100 mb-4 max-w-md mx-auto">
                        {t('publicDoctors.loginToBookPrompt')}
                    </p>
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-blue-600 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105"
                    >
                        🔐 {t('common.login')}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PublicDoctorDetailPage;