import { useState, useEffect, useCallback } from 'react';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { useTabWithUrl } from '../../../application/hooks/useTabWithUrl';
import { useMinLoadingAction } from '../../../application/hooks/useMinLoadingAction';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Button from '../../components/shared/Button';
import DashboardHeader from '../../components/medical-dashboard/DashboardHeader';
import {
    getDoctorStatistics,
    getCurrentDoctorInfo,
    type DoctorStatisticsData,
    type CurrentDoctorInfo
} from '../../../infrastructure/api/statisticsApi';
import { exportDoctorStatisticsExcel, exportDoctorStatisticsPDF } from '../../../shared/utils/exportUtils';

type Period = 'week' | 'month' | 'year';

const DoctorStatisticsPage = () => {
    const { t } = useAppTranslation();

    const { activeTab: period, setActiveTab: setPeriod } = useTabWithUrl<Period>({
        paramName: 'period',
        validValues: ['week', 'month', 'year'],
        defaultValue: 'month',
        includePage: false,
        pageZeroBased: true,
    });

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DoctorStatisticsData | null>(null);
    const [doctorInfo, setDoctorInfo] = useState<CurrentDoctorInfo | null>(null);

    // Load dữ liệu (period thay đổi sẽ tự động gọi lại)
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [info, statistics] = await Promise.all([
                getCurrentDoctorInfo(),
                getDoctorStatistics(period)
            ]);
            setDoctorInfo(info);
            setStats(statistics);
        } catch (error) {
            console.error('Failed to load statistics:', error);
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Xuất PDF
    const { execute: exportPDF, loading: exporting } = useMinLoadingAction({
        minLoadingTime: 500,
        successMessage: t('doctor.stats.exportPDF') === 'Export PDF'
            ? 'PDF report exported successfully!'
            : 'Đã xuất báo cáo PDF thành công!',
        errorMessage: t('doctor.stats.exportPDF') === 'Export PDF'
            ? 'Failed to export PDF. Please try again!'
            : 'Xuất PDF thất bại, vui lòng thử lại!',
    });

    const handleExportPDF = async () => {
        if (!stats || !doctorInfo) return;

        await exportPDF(() => {
            exportDoctorStatisticsPDF(
                stats,
                doctorInfo.name,
                doctorInfo.hospitalName,
                period,
                doctorInfo.specialtyName
            );
            return Promise.resolve();
        });
    };

    // Xuất Excel (tạm thời thông báo)
    const handleExportExcel = () => {
        if (!stats || !doctorInfo) return;

        // Map period value sang text hiển thị
        const periodTextMap: Record<Period, string> = {
            week: 'Tuần này',
            month: 'Tháng này',
            year: 'Năm nay',
        };

        exportDoctorStatisticsExcel(
            stats,
            doctorInfo.name,
            doctorInfo.hospitalName,
            period,
            periodTextMap[period],
            doctorInfo.specialtyName
        );
    };

    // Period options (dùng để hiển thị UI)
    const periodOptions = [
        { value: 'week' as Period, label: t('doctor.stats.week'), icon: '📆' },
        { value: 'month' as Period, label: t('doctor.stats.month'), icon: '📊' },
        { value: 'year' as Period, label: t('doctor.stats.year'), icon: '🎯' },
    ];

    // Stat Card Component
    const StatCard = ({
        icon,
        title,
        value,
        change,
        unit = ''
    }: {
        icon: string;
        title: string;
        value: number | string;
        change?: number;
        unit?: string;
    }) => (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{icon}</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {typeof value === 'number' ? value.toLocaleString() : value}{unit}
            </p>
            {change !== undefined && (
                <p className={`text-sm mt-2 flex items-center gap-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {change >= 0 ? '▲' : '▼'} {Math.abs(change)}% {t('doctor.stats.comparedToLastMonth')}
                </p>
            )}
        </div>
    );

    // Rating Bar Component
    const RatingBar = ({ stars, percentage, count }: { stars: number; percentage: number; count: number }) => (
        <div className="flex items-center gap-3">
            <div className="w-16 text-sm font-medium text-gray-600 dark:text-gray-400">
                {stars} ★
            </div>
            <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="w-24 text-sm text-gray-500 dark:text-gray-400 text-right">
                {percentage}% ({count})
            </div>
        </div>
    );

    if (loading) {
        return <LoadingSpinner fullScreen variant="dots" text={t('common.loading')} />;
    }

    if (!stats || !doctorInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">{t('common.noData')}</p>
                    <Button variant="primary" onClick={() => loadData()}>
                        {t('common.retry')}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Background Pattern */}
            <div className="fixed inset-0 opacity-5 pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234299e1' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                }} />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-6">
                {/* Header - Dùng DashboardHeader */}
                <DashboardHeader
                    icon="📊"
                    title={t('doctor.stats.title')}
                    subtitle={t('doctor.stats.subtitle') || 'Thống kê số liệu khám bệnh của bạn'}
                    showHospital={true}
                    hospitalName={doctorInfo?.hospitalName || ''}
                />

                {/* 4 Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        icon="👥"
                        title={t('doctor.stats.totalPatients')}
                        value={stats.summary.totalPatients}
                        change={stats.summary.totalPatientsChange}
                    />
                    <StatCard
                        icon="💰"
                        title={t('doctor.stats.revenue')}
                        value={stats.summary.revenue.toLocaleString()}
                        change={stats.summary.revenueChange}
                        unit="đ"
                    />
                    <StatCard
                        icon="⭐"
                        title={t('doctor.stats.averageRating')}
                        value={stats.summary.averageRating.toFixed(1)}
                        change={stats.summary.averageRatingChange}
                        unit="/5"
                    />
                    <StatCard
                        icon="📋"
                        title={t('doctor.stats.totalPrescriptions')}
                        value={stats.summary.totalPrescriptions}
                        change={stats.summary.totalPrescriptionsChange}
                    />
                </div>

                {/* Filter + Export Buttons */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 mb-6 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex gap-2">
                        {periodOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setPeriod(opt.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === opt.value
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {opt.icon} {opt.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleExportExcel}>
                            📥 {t('doctor.stats.exportExcel')}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportPDF} loading={exporting}>
                            📄 {t('doctor.stats.exportPDF')}
                        </Button>
                    </div>
                </div>

                {/* Trend Chart */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        📈 {t('doctor.stats.monthlyTrend')}
                    </h3>
                    <div className="flex items-end justify-between gap-1 h-48">
                        {stats.monthlyTrend.map((item, idx) => {
                            const maxCount = Math.max(...stats.monthlyTrend.map(m => m.count));
                            const height = (item.count / maxCount) * 150;
                            return (
                                <div key={idx} className="flex flex-col items-center flex-1">
                                    <div className="w-full bg-blue-500 rounded-t-lg transition-all duration-500" style={{ height: `${height}px` }} />
                                    <p className="text-xs text-gray-500 mt-2">
                                        {period === 'year' ? `T${item.month}` : `Ngày ${idx + 1}`}
                                    </p>
                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.count}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Two columns: Top Diagnoses & Top Medicines */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Top Diagnoses */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            🏥 {t('doctor.stats.topDiagnoses')}
                        </h3>
                        <div className="space-y-3">
                            {stats.topDiagnoses.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                        {idx + 1}. {item.diagnosis}
                                    </span>
                                    <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                                        {item.count} {t('doctor.stats.times')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Medicines */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            💊 {t('doctor.stats.topMedicines')}
                        </h3>
                        <div className="space-y-3">
                            {stats.topMedicines.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                        {idx + 1}. {item.medicineName}
                                    </span>
                                    <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                                        {item.count} {t('doctor.stats.prescriptions')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Rating Distribution */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        ⭐ {t('doctor.stats.ratingDistribution')}
                    </h3>
                    <div className="space-y-3">
                        {stats.ratingDistribution.map((item) => (
                            <RatingBar key={item.stars} stars={item.stars} percentage={item.percentage} count={item.count} />
                        ))}
                    </div>
                </div>

                {/* Doctor Ranking */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 mb-6 overflow-x-auto">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        👥 {t('doctor.stats.doctorRanking')}
                    </h3>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left py-3 px-2">{t('doctor.stats.rank')}</th>
                                <th className="text-left py-3 px-2">{t('common.doctorName')}</th>
                                <th className="text-center py-3 px-2">{t('doctor.stats.totalPatients')}</th>
                                <th className="text-center py-3 px-2">{t('doctor.stats.revenue')}</th>
                                <th className="text-center py-3 px-2">{t('doctor.stats.averageRating')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.doctorRanking.map((doctor) => (
                                <tr key={doctor.doctorId} className="border-b border-gray-100 dark:border-gray-700">
                                    <td className="py-3 px-2">
                                        {doctor.rank === 1 ? '🥇' : doctor.rank === 2 ? '🥈' : doctor.rank === 3 ? '🥉' : `${doctor.rank}`}
                                    </td>
                                    <td className={`py-3 px-2 font-medium ${doctor.name.includes('(Tôi)') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {doctor.name}
                                    </td>
                                    <td className="py-3 px-2 text-center">{doctor.totalPatients}</td>
                                    <td className="py-3 px-2 text-center">{doctor.revenue.toLocaleString()}đ</td>
                                    <td className="py-3 px-2 text-center">{doctor.rating.toFixed(1)} ★</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer timestamp */}
                <div className="text-center text-xs text-gray-400 dark:text-gray-500 py-4">
                    ⏱️ {t('doctor.stats.reportGeneratedAt')}: {new Date().toLocaleString('vi-VN')}
                </div>
            </div>

            {/* Print styles */}
            <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .relative.z-10, .relative.z-10 * {
            visibility: visible;
          }
          .relative.z-10 {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
          }
          button, .bg-white\/80, .backdrop-blur-sm {
            background: white !important;
            backdrop-filter: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
        </div>
    );
};

export default DoctorStatisticsPage;