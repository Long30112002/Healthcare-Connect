import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import LoadingSpinner from '../../../presentation/components/shared/LoadingSpinner';
import EmptyState from '../../../presentation/components/shared/EmptyState';
import Pagination from '../../../presentation/components/shared/Pagination';
import Input from '../../../presentation/components/shared/Input';
import DoctorVisitedCard from '../../../presentation/components/patient/DoctorVisitedCard';
import useFetch from '../../../application/hooks/useFetch';
import type { VisitedDoctor } from '../../../core/types';

const PAGE_SIZE = 6;

const VisitedDoctorsPage = () => {
    const navigate = useNavigate();
    const { t } = useAppTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const { data: doctors, loading, error, refetch } = useFetch<VisitedDoctor[]>(
        '/patients/visited-doctors',
        'GET',
        { immediate: true }
    );

    // Lọc theo tên bác sĩ hoặc chuyên khoa
    const filteredDoctors = useMemo(() => {
        if (!doctors) return [];
        if (!searchTerm.trim()) return doctors;
        
        const term = searchTerm.toLowerCase();
        return doctors.filter(doctor =>
            doctor.fullName.toLowerCase().includes(term) ||
            doctor.specialtyName.toLowerCase().includes(term)
        );
    }, [doctors, searchTerm]);

    // Phân trang
    const totalPages = Math.ceil(filteredDoctors.length / PAGE_SIZE);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const paginatedDoctors = filteredDoctors.slice(startIndex, startIndex + PAGE_SIZE);

    const handleBookAgain = (doctorId: string) => {
        navigate(`/doctors/${doctorId}`);
    };

    if (loading) {
        return <LoadingSpinner fullScreen variant="dots" text={t('common.loading')} />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button onClick={() => refetch()} className="text-primary hover:underline">
                        {t('common.retry')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">👨‍⚕️</span>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {t('visitedDoctors.title')}
                            </h1>
                            <p className="text-blue-100 text-sm mt-1">
                                {t('visitedDoctors.subtitle')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                    {/* Search Bar */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <Input
                            placeholder={t('visitedDoctors.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon="🔍"
                            fullWidth
                        />
                        {searchTerm && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                🔍 {t('visitedDoctors.searchResult', { count: filteredDoctors.length })}
                            </p>
                        )}
                    </div>

                    {/* Doctors List */}
                    <div className="p-4">
                        {!doctors || doctors.length === 0 ? (
                            <EmptyState
                                title={t('visitedDoctors.empty')}
                                description={t('visitedDoctors.emptyDesc')}
                                icon="👨‍⚕️"
                                actionText={t('visitedDoctors.findDoctor')}
                                onAction={() => navigate('/doctors')}
                            />
                        ) : filteredDoctors.length === 0 ? (
                            <EmptyState
                                title={t('visitedDoctors.noSearchResult')}
                                description={t('visitedDoctors.noSearchResultDesc')}
                                icon="🔍"
                                actionText={t('visitedDoctors.clearSearch')}
                                onAction={() => setSearchTerm('')}
                            />
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {paginatedDoctors.map((doctor) => (
                                        <DoctorVisitedCard
                                            key={doctor.id}
                                            doctor={doctor}
                                            onBookAgain={handleBookAgain}
                                            bookAgainText={t('dashboard.bookAgain')}
                                            yearsText={t('dashboard.yearsExperience')}
                                        />
                                    ))}
                                </div>

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
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisitedDoctorsPage;