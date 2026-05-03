import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import LoadingSpinner from '../../../presentation/components/shared/LoadingSpinner';
import EmptyState from '../../../presentation/components/shared/EmptyState';
import Pagination from '../../../presentation/components/shared/Pagination';
import Button from '../../../presentation/components/shared/Button';
import Input from '../../../presentation/components/shared/Input';
import { formatDateTime, formatDateShort } from '../../../shared/utils/dateUtils';
import type { MedicalRecordResponse } from '../../../core/types/api.response';
import useFetch from '../../../application/hooks/useFetch';

const PAGE_SIZE = 5;

const MyHealthPage = () => {
    const navigate = useNavigate();
    const { t } = useAppTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const { data, loading} = useFetch<MedicalRecordResponse[]>(
        '/medical-records/my-records',
        'GET',
        { immediate: true }
    );

    const medicalRecords = data ?? [];

    const filteredRecords = medicalRecords.filter(record =>
        record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const paginatedRecords = filteredRecords.slice(startIndex, startIndex + PAGE_SIZE);

    const handleViewDetail = (recordId: string) => {
        navigate(`/medical-records/${recordId}`);
    };

    if (loading) {
        return <LoadingSpinner fullScreen variant="dots" text={t('common.loading')} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl shadow-xl mb-8">
                    <div className="absolute top-0 right-0 opacity-10">
                        <svg className="w-48 h-48" fill="white" viewBox="0 0 24 24">
                            <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                        </svg>
                    </div>
                    <div className="relative z-10 p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <span className="text-3xl">💊</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    {t('myHealth.title')}
                                </h1>
                                <p className="text-blue-100 text-sm mt-0.5">
                                    {t('myHealth.subtitle')}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60" className="w-full h-8">
                            <path fill="#f0f9ff" fillOpacity="1" d="M0,32L80,37.3C160,43,320,53,480,48C640,43,800,21,960,21C1120,21,1280,43,1360,53.3L1440,64L1440,60L1360,60C1280,60,1120,60,960,60C800,60,640,60,480,60C320,60,160,60,80,60L0,60Z"></path>
                        </svg>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <Input
                        placeholder={t('myHealth.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon="🔍"
                        fullWidth
                        className="shadow-md"
                    />
                    {searchTerm && filteredRecords.length > 0 && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                            🎯 {t('myHealth.searchResult', { count: filteredRecords.length })}
                        </p>
                    )}
                </div>

                {/* Medical Records List */}
                {medicalRecords.length === 0 ? (
                    <EmptyState
                        title={t('myHealth.noRecords')}
                        description={t('myHealth.noRecordsDesc')}
                        icon="📋"
                        actionText={t('myHealth.bookNow')}
                        onAction={() => navigate('/doctors')}
                    />
                ) : filteredRecords.length === 0 ? (
                    <EmptyState
                        title={t('myHealth.noSearchResult')}
                        description={t('myHealth.noSearchResultDesc')}
                        icon="🔍"
                        actionText={t('myHealth.clearSearch')}
                        onAction={() => setSearchTerm('')}
                    />
                ) : (
                    <>
                        <div className="space-y-4">
                            {paginatedRecords.map((record, index) => (
                                <div 
                                    key={record.id} 
                                    className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
                                >
                                    {/* Gradient top bar */}
                                    <div className={`h-2 bg-gradient-to-r ${index % 2 === 0 ? 'from-blue-500 to-cyan-500' : 'from-green-500 to-teal-500'}`}></div>
                                    
                                    <div className="p-5">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center text-2xl">
                                                    📋
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                                            {formatDateShort(record.createdAt || '')}
                                                        </h3>
                                                        <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                            {record.status === 'ACTIVE' ? 'Đang điều trị' : 'Hoàn thành'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                            👨‍⚕️ {record.doctorName}
                                                        </span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block"></span>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                            🏥 {record.hospitalName}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-semibold text-primary">
                                                    {record.prescriptionCount} {t('medicalRecord.prescriptions')}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Diagnosis Box */}
                                        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                                            <div className="flex items-start gap-2">
                                                <span className="text-lg">📝</span>
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                        {t('medicalRecord.diagnosis')}
                                                    </p>
                                                    <p className="text-gray-800 dark:text-gray-200 font-medium mt-0.5">
                                                        {record.diagnosis}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Symptoms & Follow-up */}
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {record.symptoms && (
                                                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-3 py-1.5 rounded-full">
                                                    <span>💬</span>
                                                    <span className="truncate max-w-[200px]">{record.symptoms}</span>
                                                </div>
                                            )}
                                            {record.followUpDate && (
                                                <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full">
                                                    <span>📅</span>
                                                    <span>{formatDateTime(record.followUpDate, 'dd/mm/yyyy')}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Button */}
                                        <div className="flex justify-end mt-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleViewDetail(record.id)}
                                                className="group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-200"
                                            >
                                                🔍 {t('myHealth.viewDetail')}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8">
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
    );
};

export default MyHealthPage;