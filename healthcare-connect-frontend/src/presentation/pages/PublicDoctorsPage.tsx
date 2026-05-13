import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppTranslation } from '../../application/hooks/useAppTranslation';
import type { PublicDoctorResponse, SpecialtyResponse, HospitalResponse } from '../../core/types/api.response';
import { commonApi } from '../../infrastructure/api/commonApi';
import { publicDoctorApi } from '../../infrastructure/api/publicDoctorApi';
import { formatPrice } from '../../shared/utils/dateUtils';
import EmptyState from '../components/shared/EmptyState';
import Input from '../components/shared/Input';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import Pagination from '../components/shared/Pagination';

const PublicDoctorsPage = () => {
    const { t } = useAppTranslation();
    
    // State
    const [doctors, setDoctors] = useState<PublicDoctorResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;
    
    // Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('');
    const [selectedHospital, setSelectedHospital] = useState('');
    
    // Data for filters
    const [specialties, setSpecialties] = useState<SpecialtyResponse[]>([]);
    const [hospitals, setHospitals] = useState<HospitalResponse[]>([]);
    
    // Fetch filters data
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [specs, hosp] = await Promise.all([
                    commonApi.getSpecialties(),
                    commonApi.getHospitals()
                ]);
                setSpecialties(specs);
                setHospitals(hosp);
            } catch (error) {
                console.error('Failed to fetch filters:', error);
            }
        };
        fetchFilters();
    }, []);
    
    // Fetch doctors
    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const response = await publicDoctorApi.getDoctors({
                keyword: searchTerm || undefined,
                specialtyId: selectedSpecialty || undefined,
                hospitalId: selectedHospital || undefined,
                page: currentPage - 1,
                size: pageSize,
                sortBy: 'fullName',
                direction: 'asc'
            });
            setDoctors(response.content);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error('Failed to fetch doctors:', error);
            setDoctors([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchDoctors();
    }, [currentPage, searchTerm, selectedSpecialty, selectedHospital]);
    
    // Reset page when filters change
    const handleSearch = () => {
        setCurrentPage(1);
        fetchDoctors();
    };
    
    const handleSpecialtyChange = (value: string) => {
        setSelectedSpecialty(value);
        setCurrentPage(1);
    };
    
    const handleHospitalChange = (value: string) => {
        setSelectedHospital(value);
        setCurrentPage(1);
    };
    
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };
    
    // Render stars
    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - Math.ceil(rating);
        
        return (
            <div className="flex items-center gap-0.5">
                {[...Array(fullStars)].map((_, i) => (
                    <span key={`full-${i}`} className="text-yellow-400 text-sm">★</span>
                ))}
                {hasHalfStar && (
                    <span className="text-yellow-400 text-sm">½</span>
                )}
                {[...Array(emptyStars)].map((_, i) => (
                    <span key={`empty-${i}`} className="text-gray-300 dark:text-gray-600 text-sm">☆</span>
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
                        <span className="text-4xl">👨‍⚕️</span>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {t('publicDoctors.title')}
                            </h1>
                            <p className="text-blue-100 text-sm mt-1">
                                {t('publicDoctors.subtitle')}
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Filters */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <Input
                            placeholder={t('publicDoctors.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon="🔍"
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <select
                            value={selectedSpecialty}
                            onChange={(e) => handleSpecialtyChange(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white"
                        >
                            <option value="">{t('publicDoctors.allSpecialties')}</option>
                            {specialties.map((spec) => (
                                <option key={spec.id} value={spec.id}>{spec.name}</option>
                            ))}
                        </select>
                        <select
                            value={selectedHospital}
                            onChange={(e) => handleHospitalChange(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white"
                        >
                            <option value="">{t('publicDoctors.allHospitals')}</option>
                            {hospitals.map((hospital) => (
                                <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                        >
                            🔍 {t('common.search')}
                        </button>
                    </div>
                </div>
                
                {/* Doctors List */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-900 dark:text-white">
                        📋 {t('publicDoctors.doctorsList')} ({doctors.length})
                    </div>
                    
                    <div className="p-4">
                        {doctors.length === 0 ? (
                            <EmptyState
                                title={t('publicDoctors.noDoctors')}
                                description={t('publicDoctors.noDoctorsDesc')}
                                icon="👨‍⚕️"
                            />
                        ) : (
                            <div className="space-y-4">
                                {doctors.map((doctor) => (
                                    <div key={doctor.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-700">
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            {/* Avatar */}
                                            <div className="flex-shrink-0">
                                                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 flex items-center justify-center text-3xl shadow-md">
                                                    {doctor.fullName?.charAt(0) || '👨‍⚕️'}
                                                </div>
                                            </div>
                                            
                                            {/* Info */}
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        {doctor.fullName}
                                                    </h3>
                                                    <Link
                                                        to={`/doctors/public/${doctor.id}`}
                                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                                    >
                                                        {t('publicDoctors.viewDetail')} →
                                                    </Link>
                                                </div>
                                                
                                                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                                    {doctor.specialtyName}
                                                </p>
                                                
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    🏥 {doctor.hospitalName}
                                                </p>
                                                
                                                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <span>🎓 {doctor.experienceYears} {t('doctor.yearsExperience')}</span>
                                                    <span>💰 {formatPrice(doctor.consultationFee)}</span>
                                                </div>
                                                
                                                {/* Rating */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    {renderStars(doctor.averageRating)}
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        ({doctor.totalReviews} {t('doctor.reviews')})
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
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
                                    onPageChange={handlePageChange}
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

export default PublicDoctorsPage;