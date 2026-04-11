import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { useMinLoadingAction } from '../../../application/hooks/useMinLoadingAction';
import useFetch from '../../../application/hooks/useFetch';
import { patientApi } from '../../../infrastructure/api/patientApi';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';
import { formatDateToVietnam } from '../../../shared/utils/dateUtils';
import type { DoctorListItem } from '../../../core/types';

const DoctorsPage = () => {
    const { t, currentLanguage } = useAppTranslation();

    // State cho từng section
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedRange, setSelectedRange] = useState(30);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('');

    // Data states
    const [dateDoctors, setDateDoctors] = useState<DoctorListItem[]>([]);
    const [rangeDoctors, setRangeDoctors] = useState<DoctorListItem[]>([]);

    // Search section - dùng useFetch
    const { data: allDoctors, loading: searchLoading } = useFetch<DoctorListItem[]>(
        '/patients/doctors/available?days=300',
        'GET',
        { immediate: true }
    );

    const { execute: executeDate, loading: dateLoading } = useMinLoadingAction<DoctorListItem[]>({
        minLoadingTime: 1000,

        onSuccess: (data) => {
            setDateDoctors(data || []);
        },
        onError: () => {
            setDateDoctors([]);
        }
    });

    const { execute: executeRange, loading: rangeLoading } = useMinLoadingAction<DoctorListItem[]>({
        minLoadingTime: 1000,
        onSuccess: (data) => {
            setRangeDoctors(data || []);
        },
        onError: () => {
            setRangeDoctors([]);
        }
    });

    // Load initial data cho Range section (mặc định 30 ngày)
    useEffect(() => {
        executeRange(() => patientApi.getAvailableDoctorsByDays(selectedRange));
    }, []);

    // Khi selectedDate thay đổi
    useEffect(() => {
        if (selectedDate) {
            executeDate(() => patientApi.getAvailableDoctorsByDate(selectedDate));
        }
    }, [selectedDate]);

    // Khi selectedRange thay đổi
    useEffect(() => {
        if (selectedRange > 0 && !selectedDate) {
            executeRange(() => patientApi.getAvailableDoctorsByDays(selectedRange));
        }
    }, [selectedRange]);

    // Lọc kết quả tìm kiếm
    const filteredSearchDoctors = (allDoctors || []).filter(doctor => {
        const matchesSearch = doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.specialtyName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpecialty = !selectedSpecialty || doctor.specialtyName === selectedSpecialty;
        return matchesSearch && matchesSpecialty;
    });

    const specialties = [...new Set((allDoctors || []).map(d => d.specialtyName))];

    // Xử lý chọn ngày
    const handleDateChange = (date: string) => {
        setSelectedDate(date);
        setSelectedRange(0);
    };

    // Xử lý chọn khoảng
    const handleRangeChange = (days: number) => {
        setSelectedRange(days);
        setSelectedDate('');
    };

    // Component hiển thị danh sách bác sĩ
    const DoctorGrid = ({ doctors, loading, emptyMessage }: {
        doctors: DoctorListItem[] | null;
        loading: boolean;
        emptyMessage: string;
    }) => {
        const safeDoctors = Array.isArray(doctors) ? doctors : [];

        if (loading) {
            return (
                <div className="flex justify-center py-8">
                    <LoadingSpinner size="md" />
                </div>
            );
        }

        if (safeDoctors.length === 0) {
            return <EmptyState title={t('page.doctors.noDoctorsFound')} description={emptyMessage} icon="👨‍⚕️" />;
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                {safeDoctors.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} />)}
            </div>
        );
    };

    // Component card bác sĩ
    const DoctorCard = ({ doctor }: { doctor: DoctorListItem }) => (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 flex items-center justify-center text-xl shadow-md">
                        {doctor.avatar ? (
                            <img src={doctor.avatar} alt={doctor.fullName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            doctor.fullName.charAt(0)
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                            {doctor.fullName}
                        </h3>
                        <p className="text-xs text-primary font-medium">{doctor.specialtyName}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-yellow-500 text-sm">⭐</span>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                {doctor.rating > 0 ? doctor.rating.toFixed(1) : t('page.doctors.noRating')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs">
                    <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <span>🏥</span> {doctor.hospitalName}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <span>🎓</span> {doctor.experienceYears} {t('page.doctors.yearsExperience')}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <span>📅</span> {doctor.availableSchedules} {t('page.doctors.availableSchedules')}
                    </p>
                    <p className="text-base font-bold text-primary mt-2">
                        {doctor.consultationFee?.toLocaleString()}đ
                    </p>
                </div>

                <Link
                    to={`/doctors/${doctor.id}`}
                    className="mt-3 block w-full text-center px-3 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium"
                >
                    {t('page.doctors.book')}
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
            <div className="container mx-auto px-4">
                {/* ===== SECTION 1: CHỌN NGÀY CỤ THỂ ===== */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">📅</span>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                            {t('page.doctors.selectDate')}
                        </h2>
                    </div>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="w-full md:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white text-sm"
                        min={new Date().toISOString().split('T')[0]}
                    />
                    {selectedDate && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                            ✓ {t('page.doctors.showingForDate')}: {formatDateToVietnam(selectedDate, currentLanguage as 'vi' | 'en')}
                        </p>
                    )}
                    <DoctorGrid
                        doctors={dateDoctors || []}
                        loading={dateLoading}
                        emptyMessage={selectedDate ? t('page.doctors.tryDifferentDate') : t('page.doctors.selectDateHint')}
                    />
                </div>

                {/* ===== SECTION 2: KHOẢNG THỜI GIAN ===== */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">⏰</span>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                            {t('page.doctors.selectRange')}
                        </h2>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {[
                            { days: 1, label: t('page.doctors.today') },
                            { days: 7, label: t('page.doctors.thisWeek') },
                            { days: 30, label: t('page.doctors.thisMonth') },
                            { days: 90, label: t('page.doctors.threeMonths') },
                        ].map((range) => (
                            <button
                                key={range.days}
                                onClick={() => handleRangeChange(range.days)}
                                className={`px-3 py-1.5 rounded-lg text-sm transition ${selectedRange === range.days && !selectedDate
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        📍 {t('page.doctors.showingWithinDays')} {selectedRange} {t('page.doctors.daysForward')}
                    </p>
                    <DoctorGrid
                        doctors={rangeDoctors || []}
                        loading={rangeLoading}
                        emptyMessage={t('page.doctors.noDoctorsInRange')}
                    />
                </div>

                {/* ===== SECTION 3: TÌM KIẾM ===== */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">🔍</span>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                            {t('page.doctors.searchTitle')}
                        </h2>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 mb-3">
                        <input
                            type="text"
                            placeholder={t('page.doctors.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white text-sm"
                        />
                        <select
                            value={selectedSpecialty}
                            onChange={(e) => setSelectedSpecialty(e.target.value)}
                            className="md:w-48 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white text-sm"
                        >
                            <option value="">📋 {t('page.doctors.allSpecialties')}</option>
                            {specialties.map((specialty, idx) => (
                                <option key={idx} value={specialty}>{specialty}</option>
                            ))}
                        </select>
                    </div>
                    {(searchTerm || selectedSpecialty) && (
                        <p className="text-xs text-green-600 dark:text-green-400 mb-3">
                            ✓ {currentLanguage === 'vi'
                                ? `Tìm thấy ${filteredSearchDoctors.length} bác sĩ`
                                : `Found ${filteredSearchDoctors.length} doctor${filteredSearchDoctors.length !== 1 ? 's' : ''}`}
                        </p>
                    )}
                    <DoctorGrid
                        doctors={filteredSearchDoctors || []}
                        loading={searchLoading}
                        emptyMessage={t('page.doctors.noSearchResults')}
                    />
                </div>
            </div>
        </div>
    );
};

export default DoctorsPage;