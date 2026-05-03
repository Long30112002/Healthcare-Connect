import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import LoadingSpinner from '../../../presentation/components/shared/LoadingSpinner';
import EmptyState from '../../../presentation/components/shared/EmptyState';
import Pagination from '../../../presentation/components/shared/Pagination';
import Button from '../../../presentation/components/shared/Button';
import Input from '../../../presentation/components/shared/Input';
import { formatDateShort, formatPrice } from '../../../shared/utils/dateUtils';
import type { MedicalRecordResponse } from '../../../core/types/api.response';
import useFetch from '../../../application/hooks/useFetch';
import type { Prescription } from '../../../core/types';

const PAGE_SIZE = 4;

const PrescriptionsPage = () => {
    const navigate = useNavigate();
    const { t } = useAppTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const { data, loading, error, refetch } = useFetch<MedicalRecordResponse[]>(
        '/medical-records/my-records',
        'GET',
        { immediate: true }
    );


    // Lọc tất cả đơn thuốc từ các bệnh án
    const allPrescriptions = useMemo(() => {
        if (!data) return [];

        const prescriptions: (Prescription & { doctorName: string; hospitalName: string; medicalRecordId: string })[] = [];

        data.forEach((record) => {
            if (record.prescriptions && record.prescriptions.length > 0) {
                record.prescriptions.forEach((pres) => {
                    prescriptions.push({
                        ...pres,
                        doctorName: record.doctorName,
                        hospitalName: record.hospitalName,
                        medicalRecordId: record.id
                    });
                });
            }
        });

        return prescriptions;
    }, [data]);

    // Lọc theo tìm kiếm
    const filteredPrescriptions = useMemo(() => {
        if (!searchTerm.trim()) return allPrescriptions;

        const term = searchTerm.toLowerCase();
        return allPrescriptions.filter(pres =>
            pres.doctorName.toLowerCase().includes(term) ||
            pres.items.some(item => item.medicineName.toLowerCase().includes(term))
        );
    }, [allPrescriptions, searchTerm]);

    // Phân trang
    const totalPages = Math.ceil(filteredPrescriptions.length / PAGE_SIZE);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const paginatedPrescriptions = filteredPrescriptions.slice(startIndex, startIndex + PAGE_SIZE);

    const handleViewDetail = (medicalRecordId: string) => {
        navigate(`/medical-records/${medicalRecordId}`);
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
                        <span className="text-4xl">💊</span>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {t('prescriptions.title')}
                            </h1>
                            <p className="text-blue-100 text-sm mt-1">
                                {t('prescriptions.subtitle')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
                    {/* Search */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <Input
                            placeholder={t('prescriptions.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon="🔍"
                            fullWidth
                        />
                        {searchTerm && filteredPrescriptions.length > 0 && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                🔍 {t('prescriptions.searchResult', { count: filteredPrescriptions.length })}
                            </p>
                        )}
                    </div>

                    {/* Prescriptions List */}
                    {allPrescriptions.length === 0 ? (
                        <EmptyState
                            title={t('prescriptions.empty')}
                            description={t('prescriptions.emptyDesc')}
                            icon="💊"
                        />
                    ) : filteredPrescriptions.length === 0 ? (
                        <EmptyState
                            title={t('prescriptions.noSearchResult')}
                            description={t('prescriptions.noSearchResultDesc')}
                            icon="🔍"
                            actionText={t('prescriptions.clearSearch')}
                            onAction={() => setSearchTerm('')}
                        />
                    ) : (
                        <>
                            <div className="p-4 space-y-4">
                                {paginatedPrescriptions.map((pres) => (
                                    <div key={pres.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                        {/* Card Header */}
                                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                                            <div className="flex justify-between items-start flex-wrap gap-2">
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-semibold text-gray-900 dark:text-white">
                                                            📅 {formatDateShort(pres.prescriptionDate)}
                                                        </span>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${pres.valid
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                            }`}>
                                                            {pres.valid ? `✅ ${t('prescriptions.valid')}` : `❌ ${t('prescriptions.expired')}`}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        👨‍⚕️ {pres.doctorName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                                        🏥 {pres.hospitalName}
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleViewDetail(pres.medicalRecordId)}
                                                >
                                                    🔍 {t('prescriptions.viewDetail')}
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Medicines List */}
                                        <div className="p-4">
                                            <div className="space-y-2">
                                                {pres.items.map((item) => (
                                                    <div key={item.id} className="flex justify-between items-start py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                💊 {item.medicineName}
                                                            </p>
                                                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                <span>📦 Số lượng: {item.quantity}</span>
                                                                <span>💊 Liều: {item.dosage}</span>
                                                                <span>⏰ Tần suất: {item.frequency}</span>
                                                                {item.duration > 0 && <span>📅 Số ngày: {item.duration}</span>}
                                                            </div>
                                                            {item.instructions && (
                                                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                                    📝 Hướng dẫn: {item.instructions}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                                                {formatPrice(item.totalPrice)}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {formatPrice(item.unitPrice)}/{item.medicineUnit}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Total Amount */}
                                            <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 text-right">
                                                <p className="text-sm font-bold text-primary">
                                                    {t('prescriptions.totalAmount')}: {formatPrice(pres.totalAmount)}
                                                </p>
                                            </div>

                                            {/* Note */}
                                            {pres.note && (
                                                <div className="mt-3 inline-block px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                                    <p className="text-xs text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                                                        <span>📌</span>
                                                        <span>{pres.note}</span>
                                                    </p>
                                                </div>
                                            )}
                                            {/* Valid Until */}
                                            {pres.validUntil && (
                                                <div className="mt-2 text-xs text-gray-500">
                                                    {t('prescriptions.validUntil')}: {formatDateShort(pres.validUntil)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
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
    );
};

export default PrescriptionsPage;