import { useState, useEffect } from 'react';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import StatCard from '../../components/shared/StatCard';
import type { StatisticsResponse, HourlyStatistic, DoctorStatistic, DailyStatistic } from '../../../core/types/api.response';
import { receptionistApi } from '../../../infrastructure/api/receptionistApi';
import { getMockSummary, getMockHourly, getMockDoctors, getMockDaily } from '../../../shared/mock/statisticsMock';
import toast from 'react-hot-toast';
import FilterTabs from '../../components/shared/FilterTabs';
import { t } from 'i18next';

type Period = 'today' | 'week' | 'month' | 'quarter' | 'halfyear' | 'year';

const USE_MOCK_DATA = false;

const periodOptions = [
    { key: 'today', label: t('statistics.period.today'), icon: '📅' },
    { key: 'week', label: t('statistics.period.week'), icon: '📆' },
    { key: 'month', label: t('statistics.period.month'), icon: '📊' },
    { key: 'quarter', label: t('statistics.period.quarter'), icon: '📈' },
    { key: 'halfyear', label: t('statistics.period.halfyear'), icon: '📉' },
    { key: 'year', label: t('statistics.period.year'), icon: '🎯' },
];

const ReceptionistStatistics = () => {
    const { t } = useAppTranslation();
    const [period, setPeriod] = useState<Period>('month');
    const [summary, setSummary] = useState<StatisticsResponse | null>(null);
    const [hourlyStats, setHourlyStats] = useState<HourlyStatistic[]>([]);
    const [doctorStats, setDoctorStats] = useState<DoctorStatistic[]>([]);
    const [dailyStats, setDailyStats] = useState<DailyStatistic[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStatistics = async () => {
        setLoading(true);
        if (USE_MOCK_DATA) {
            setTimeout(() => {
                setSummary(getMockSummary(period));
                setHourlyStats(getMockHourly());
                setDoctorStats(getMockDoctors());
                setDailyStats(getMockDaily());
                setLoading(false);
            }, 500);
            return;
        }
        try {
            console.log('Calling APIs with period:', period);

            const [summaryData, hourlyData, doctorData, dailyData] = await Promise.all([
                receptionistApi.getStatisticsByPeriod(period),
                receptionistApi.getHourlyStatistics(),
                receptionistApi.getDoctorStatistics(),
                receptionistApi.getDailyStatistics(),
            ]);
            console.log('Summary response:', summaryData);   // 👈 LOG
            console.log('Hourly response:', hourlyData);     // 👈 LOG
            console.log('Doctor response:', doctorData);     // 👈 LOG
            console.log('Daily response:', dailyData);       // 👈 LOG
            setSummary(summaryData);
            setHourlyStats(Array.isArray(hourlyData) ? hourlyData : []);
            setDoctorStats(Array.isArray(doctorData) ? doctorData : []);
            setDailyStats(Array.isArray(dailyData) ? dailyData : []);
        } catch (error) {
            toast.error(t('statistics.loadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatistics();
    }, [period]);

    const safeMap = <T,>(data: T[] | undefined, callback: (item: T, index: number) => React.ReactNode) => {
        if (!data || data.length === 0) {
            return <p className="text-gray-500 text-center py-8">{t('statistics.noData')}</p>;
        }
        return <>{data.map(callback)}</>;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-white">📊 {t('statistics.title')}</h1>
                    <p className="text-blue-100 text-xs sm:text-sm mt-0.5 sm:mt-1">{t('statistics.subtitle')}</p>
                </div>

                {/* Period Filter - Scroll ngang trên mobile */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                    <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide py-1 pl-1">
                        <FilterTabs
                            options={periodOptions}
                            activeKey={period}
                            onSelect={(key) => setPeriod(key as Period)}
                            variant="default"
                            size="sm"
                            className="py-1"
                        />
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <StatCard value={summary?.totalAppointments || 0} label={t('statistics.totalAppointments')} color="blue" loading={loading} />
                    <StatCard value={summary?.checkedIn || 0} label={t('statistics.checkedIn')} color="green" loading={loading} />
                    <StatCard value={summary?.waiting || 0} label={t('statistics.waiting')} color="yellow" loading={loading} />
                    <StatCard value={summary?.cancelled || 0} label={t('statistics.cancelled')} color="red" loading={loading} />
                    <StatCard value={summary?.checkInRate || 0} label={t('statistics.checkInRate')} color="purple" loading={loading} suffix="%" />
                </div>

                {loading ? (
                    <div className="py-12 flex justify-center">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : (
                    <>
                        {/* Progress Bar */}
                        <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                            <div className="flex justify-between text-xs sm:text-sm mb-1">
                                <span>{t('statistics.checkInRate')}</span>
                                <span>{summary?.checkInRate || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${summary?.checkInRate || 0}%` }} />
                            </div>
                        </div>

                        {/* Two columns layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                            {/* Hourly Statistics */}
                            <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                                    📈 {t('statistics.hourlyChart')}
                                </h3>
                                {safeMap(hourlyStats, (stat) => (
                                    <div key={stat.hour} className="flex items-center gap-2 mb-2">
                                        <div className="w-10 text-xs sm:text-sm font-medium text-gray-600">{stat.hour}:00</div>
                                        <div className="flex-1 h-5 sm:h-6 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 text-[10px] sm:text-xs text-white flex items-center justify-end pr-2" style={{ width: `${Math.min(100, (stat.total / 50) * 100)}%` }}>
                                                {stat.total > 0 && stat.total}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Doctor Ranking */}
                            <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                                    👨‍⚕️ {t('statistics.doctorRanking')}
                                </h3>
                                {safeMap(doctorStats, (doctor, idx) => (
                                    <div key={doctor.doctorId} className="flex items-center justify-between border-b pb-2 mb-2">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <span className="w-5 text-base sm:text-lg font-bold text-gray-400">#{idx + 1}</span>
                                            <span className="font-medium text-gray-800 dark:text-white text-xs sm:text-sm">{doctor.doctorName}</span>
                                        </div>
                                        <div className="flex gap-2 sm:gap-4 text-xs sm:text-sm">
                                            <span className="text-green-600">✅ {doctor.checkedInPatients}</span>
                                            <span className="text-gray-500">📋 {doctor.totalPatients}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Daily Statistics Table */}
                        <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm overflow-x-auto">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                                📅 {t('statistics.dailyChart')}
                            </h3>
                            <table className="w-full text-xs sm:text-sm">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="p-2 text-left">{t('statistics.date')}</th>
                                        <th className="p-2 text-center">{t('statistics.totalAppointments')}</th>
                                        <th className="p-2 text-center">{t('statistics.checkedIn')}</th>
                                        <th className="p-2 text-center">{t('statistics.waiting')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dailyStats.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center text-gray-500 py-8">
                                                {t('statistics.noData')}
                                            </td>
                                        </tr>
                                    ) : (
                                        dailyStats.map((stat) => (
                                            <tr key={stat.date} className="border-b">
                                                <td className="p-2">{stat.date}</td>
                                                <td className="p-2 text-center">{stat.total}</td>
                                                <td className="p-2 text-center text-green-600">{stat.checkedIn}</td>
                                                <td className="p-2 text-center text-yellow-600">{stat.waiting}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReceptionistStatistics;