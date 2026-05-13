import { useState, useEffect } from 'react';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import { useAuth } from '../../../application/context/AuthContext';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Button from '../../components/shared/Button';
import DashboardHeader from '../../components/medical-dashboard/DashboardHeader';
import { managerApi } from '../../../infrastructure/api/managerApi';
import toast from 'react-hot-toast';
import type { TopDoctorResponse, WeeklyStatResponse } from '../../../core/types';
import { statisticsApi } from '../../../infrastructure/api/statisticsApi';
import { formatPrice } from '../../../shared/utils/dateUtils';
import { t } from 'i18next';
import { useTabWithUrl } from '../../../application/hooks/useTabWithUrl';
import { exportManagerStatisticsExcel, exportManagerStatisticsPDF, type ManagerReportData } from '../../../shared/utils/managerExportUtils';

type Period = 'week' | 'month' | 'year' | 'custom';

const periodOptions = [
    { value: 'week', label: t('statistics.period.week'), icon: '📆' },
    { value: 'month', label: t('statistics.period.month'), icon: '📊' },
    { value: 'year', label: t('statistics.period.year'), icon: '🎯' },
];

interface RevenueData {
    month: number;
    year: number;
    revenue: number;
}

interface DepartmentStat {
    departmentName: string;
    totalPatients: number;
    totalRevenue: number;
}

interface TopMedicine {
    medicineName: string;
    prescriptionCount: number;
}

const ManagerStatisticsPage = () => {
    const { t } = useAppTranslation();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    // States
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const [topDoctorsByRevenue, setTopDoctorsByRevenue] = useState<TopDoctorResponse[]>([]);
    const [topDoctorsByPatients, setTopDoctorsByPatients] = useState<TopDoctorResponse[]>([]);
    const [departmentStats, setDepartmentStats] = useState<DepartmentStat[]>([]);
    const [topMedicines, setTopMedicines] = useState<TopMedicine[]>([]);
    const [weeklyStats, setWeeklyStats] = useState<WeeklyStatResponse[]>([]);

    const { activeTab: period, setActiveTab: setPeriod } = useTabWithUrl<Period>({
        paramName: 'period',
        validValues: ['week', 'month', 'year'],
        defaultValue: 'month',
        pageZeroBased: false,
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [
                revenue,
                topRevenue,
                topPatients,
                departments,
                medicines,
                weekly,
            ] = await Promise.all([
                statisticsApi.getRevenueByMonth(),
                managerApi.getTopDoctors(5),
                managerApi.getTopDoctors(5),
                statisticsApi.getDepartmentStatistics(),
                statisticsApi.getTopMedicines(5),
                managerApi.getWeeklyStatistics(),
            ]);
            setRevenueData(revenue);
            setTopDoctorsByRevenue(topRevenue);
            setTopDoctorsByPatients(topPatients);
            setDepartmentStats(departments);
            setTopMedicines(medicines);
            setWeeklyStats(weekly);
        } catch (error) {
            console.error('Failed to fetch statistics:', error);
            toast.error(t('common.loadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [period]);

    const getMaxRevenue = () => {
        if (revenueData.length === 0) return 0;
        return Math.max(...revenueData.map(r => r.revenue));
    };

    const handleExportExcel = () => {
        const reportData: ManagerReportData = {
            revenues: revenueData,
            departments: departmentStats,
            topMedicines: topMedicines,
            topDoctors: topDoctorsByRevenue,
            hospitalName: user?.fullName?.includes('Manager') ? 'Bệnh viện của bạn' : '',
            period: period,
        };
        exportManagerStatisticsExcel(reportData);
        toast.success(t('statistics.export.success'));
    };

    const handleExportPDF = () => {
        const reportData: ManagerReportData = {
            revenues: revenueData,
            departments: departmentStats,
            topMedicines: topMedicines,
            topDoctors: topDoctorsByRevenue,
            hospitalName: user?.fullName?.includes('Manager') ? 'Bệnh viện của bạn' : '',
            period: period,
        };
        exportManagerStatisticsPDF(reportData);
        toast.success(t('statistics.export.success'));
    };

    // Get month name
    const getMonthName = (month: number) => {
        const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        return monthNames[month - 1];
    };

    // Get max count for weekly chart
    const maxWeeklyCount = Math.max(...weeklyStats.map(w => w.count), 0);

    if (loading) {
        return <LoadingSpinner fullScreen variant="dots" text={t('common.loading')} />;
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="relative z-10 container mx-auto px-4 py-6">
                {/* Header */}
                <div className="relative z-10 container mx-auto">
                    <DashboardHeader
                        icon="📊"
                        title={t('statistics.title')}
                        subtitle={t('statistics.subtitle')}
                        showHospital={true}
                        hospitalName={user?.fullName?.includes('Manager') ? t('manager.yourHospital') : ''}
                    />
                </div>

                {/* Revenue Chart */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        📈 {t('statistics.revenueChart')}
                    </h3>
                    <div className="relative h-64">
                        <div className="flex items-end justify-between gap-1 h-56">
                            {revenueData.map((item, idx) => {
                                const maxRevenue = getMaxRevenue();
                                const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 200 : 0;
                                return (
                                    <div key={idx} className="flex flex-col items-center flex-1">
                                        <div className="relative w-full group">
                                            <div
                                                className="w-full bg-blue-500 rounded-t-lg transition-all duration-500 hover:bg-blue-600 cursor-pointer"
                                                style={{ height: `${height}px` }}
                                            />
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                                                {formatPrice(item.revenue)}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">{getMonthName(item.month)}</p>
                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.year}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Two columns: Top Doctors */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Top Doctors by Revenue */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            👨‍⚕️ {t('statistics.topDoctorsByRevenue')}
                        </h3>
                        <div className="space-y-3">
                            {topDoctorsByRevenue.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">{t('statistics.noData')}</p>
                            ) : (
                                topDoctorsByRevenue.map((doctor, idx) => (
                                    <div key={doctor.doctorId} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-gray-400 w-6">
                                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
                                            </span>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{doctor.doctorName}</p>
                                                <p className="text-xs text-gray-500">{doctor.specialtyName}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {/* Doanh thu đã thu (tài chính) */}
                                            <p className="text-sm font-semibold text-primary">
                                                {formatPrice(doctor.totalRevenueCollected)}
                                            </p>
                                            {/* Doanh thu từ ca hoàn thành + Số BN đã khám */}
                                            <p className="text-xs text-gray-500">
                                                {formatPrice(doctor.totalRevenueCompleted)} {t('statistics.from')} {doctor.totalPatientsCompleted} {t('statistics.patients')}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Top Doctors by Patients */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            👨‍⚕️ {t('statistics.topDoctorsByPatients')}
                        </h3>
                        <div className="space-y-3">
                            {topDoctorsByPatients.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">{t('statistics.noData')}</p>
                            ) : (
                                topDoctorsByPatients.map((doctor, idx) => (
                                    <div key={doctor.doctorId} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-gray-400 w-6">
                                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
                                            </span>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{doctor.doctorName}</p>
                                                <p className="text-xs text-gray-500">{doctor.specialtyName}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-primary">{doctor.totalPatientsCompleted} {t('statistics.patients')}</p>
                                            <p className="text-xs text-gray-500">{formatPrice(doctor.totalRevenueCollected)}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Department Statistics */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        🏥 {t('statistics.departmentStats')}
                    </h3>
                    {departmentStats.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">{t('statistics.noData')}</p>
                    ) : (
                        <div className="space-y-3">
                            {departmentStats.map((dept, idx) => {
                                const maxRevenue = Math.max(...departmentStats.map(d => d.totalRevenue));
                                const widthPercent = maxRevenue > 0 ? (dept.totalRevenue / maxRevenue) * 100 : 0;
                                return (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">{dept.departmentName}</span>
                                            <span className="text-gray-500">
                                                {dept.totalPatients} {t('statistics.patients')} | {formatPrice(dept.totalRevenue)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                                            <div
                                                className="bg-blue-500 h-full rounded-full flex items-center justify-end px-2 text-xs text-white font-medium"
                                                style={{ width: `${widthPercent}%` }}
                                            >
                                                {widthPercent > 15 && formatPrice(dept.totalRevenue)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Top Medicines & Weekly Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Top Medicines */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            💊 {t('statistics.topMedicines')}
                        </h3>
                        <div className="space-y-3">
                            {topMedicines.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">{t('statistics.noData')}</p>
                            ) : (
                                topMedicines.map((medicine, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-gray-400 w-6">
                                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
                                            </span>
                                            <span className="font-medium text-gray-900 dark:text-white">{medicine.medicineName}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-primary">{medicine.prescriptionCount} {t('statistics.prescriptions')}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Weekly Chart */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            📅 {t('statistics.weeklyPatients')}
                        </h3>
                        <div className="flex items-end justify-between gap-2 h-48">
                            {weeklyStats.map((stat, idx) => {
                                const height = maxWeeklyCount > 0 ? (stat.count / maxWeeklyCount) * 150 : 0;
                                return (
                                    <div key={idx} className="flex flex-col items-center flex-1">
                                        <div className="w-full bg-green-500 rounded-t-lg transition-all duration-500" style={{ height: `${height}px` }} />
                                        <p className="text-xs text-gray-500 mt-2">{stat.day}</p>
                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                            {stat.count} {t('statistics.patients')}
                                        </p>                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Export Buttons*/}
                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" size="sm" onClick={handleExportExcel}>
                        📥 {t('statistics.export.excel')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportPDF}>
                        📄 {t('statistics.export.pdf')}
                    </Button>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-gray-400 dark:text-gray-500 py-4">
                    ⏱️ {t('statistics.reportGeneratedAt')}: {new Date().toLocaleString('vi-VN')}
                </div>
            </div>
        </div>
    );
};

export default ManagerStatisticsPage;