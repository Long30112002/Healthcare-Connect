import { useState, useEffect } from 'react';
import { useAppTranslation } from '../../../application/hooks/useAppTranslation';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import type { StatisticsResponse, HourlyStatistic, DoctorStatistic, DailyStatistic } from '../../../core/types/api.response';
import { receptionistApi } from '../../../infrastructure/api/receptionistApi';
import toast from 'react-hot-toast';
import Button from '../../components/shared/Button';

type Period = 'today' | 'week' | 'month' | 'quarter' | 'halfyear' | 'year';

// Mock data flag
const USE_MOCK_DATA = true;

// Mock data functions
const getMockSummary = (period: Period): StatisticsResponse => {
    switch (period) {
        case 'today':
            return { totalAppointments: 28, checkedIn: 18, waiting: 8, cancelled: 1, noShow: 1, checkInRate: 64.3 };
        case 'week':
            return { totalAppointments: 156, checkedIn: 98, waiting: 45, cancelled: 8, noShow: 5, checkInRate: 62.8 };
        case 'month':
            return { totalAppointments: 620, checkedIn: 410, waiting: 165, cancelled: 30, noShow: 15, checkInRate: 66.1 };
        default:
            return { totalAppointments: 1850, checkedIn: 1220, waiting: 490, cancelled: 95, noShow: 45, checkInRate: 65.9 };
    }
};

const getMockHourly = (): HourlyStatistic[] => [
    { hour: 8, total: 12, checkedIn: 8, waiting: 4 },
    { hour: 9, total: 25, checkedIn: 18, waiting: 7 },
    { hour: 10, total: 32, checkedIn: 24, waiting: 8 },
    { hour: 11, total: 28, checkedIn: 20, waiting: 8 },
    { hour: 13, total: 18, checkedIn: 12, waiting: 6 },
    { hour: 14, total: 22, checkedIn: 14, waiting: 8 },
    { hour: 15, total: 19, checkedIn: 12, waiting: 7 },
    { hour: 16, total: 15, checkedIn: 10, waiting: 5 },
    { hour: 17, total: 10, checkedIn: 6, waiting: 4 },
];

const getMockDoctors = (): DoctorStatistic[] => [
    { doctorId: '1', doctorName: 'BS. Nguyễn Văn An', totalPatients: 45, checkedInPatients: 38 },
    { doctorId: '2', doctorName: 'BS. Trần Thị Bình', totalPatients: 38, checkedInPatients: 30 },
    { doctorId: '3', doctorName: 'BS. Lê Văn Cường', totalPatients: 32, checkedInPatients: 25 },
    { doctorId: '4', doctorName: 'BS. Phạm Thị Dung', totalPatients: 28, checkedInPatients: 22 },
    { doctorId: '5', doctorName: 'BS. Hoàng Văn Em', totalPatients: 24, checkedInPatients: 18 },
];

const getMockDaily = (): DailyStatistic[] => [
    { date: '2026-04-08', total: 28, checkedIn: 18, waiting: 10 },
    { date: '2026-04-09', total: 32, checkedIn: 20, waiting: 12 },
    { date: '2026-04-10', total: 35, checkedIn: 22, waiting: 13 },
    { date: '2026-04-11', total: 30, checkedIn: 19, waiting: 11 },
    { date: '2026-04-12', total: 25, checkedIn: 16, waiting: 9 },
    { date: '2026-04-13', total: 38, checkedIn: 25, waiting: 13 },
    { date: '2026-04-14', total: 42, checkedIn: 28, waiting: 14 },
];

const ReceptionistStatistics = () => {
    const { t } = useAppTranslation();
    const [period, setPeriod] = useState<Period>('month');
    const [summary, setSummary] = useState<StatisticsResponse | null>(null);
    const [hourlyStats, setHourlyStats] = useState<HourlyStatistic[]>([]);
    const [doctorStats, setDoctorStats] = useState<DoctorStatistic[]>([]);
    const [dailyStats, setDailyStats] = useState<DailyStatistic[]>([]);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);

    const periods: { value: Period; label: string }[] = [
        { value: 'today', label: t('statistics.period.today') },
        { value: 'week', label: t('statistics.period.week') },
        { value: 'month', label: t('statistics.period.month') },
        { value: 'quarter', label: t('statistics.period.quarter') },
        { value: 'halfyear', label: t('statistics.period.halfyear') },
        { value: 'year', label: t('statistics.period.year') },
    ];

    // Helper để đảm bảo an toàn khi map
    const safeMap = <T,>(data: T[] | undefined, callback: (item: T, index: number) => React.ReactNode) => {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return <p className="text-gray-500 text-center py-8">{t('statistics.noData')}</p>;
        }
        return <>{data.map(callback)}</>;
    };

    const fetchStatistics = async () => {
        setStatsLoading(true);
        setLoading(true);

        if (USE_MOCK_DATA) {
            setTimeout(() => {
                setSummary(getMockSummary(period));
                setHourlyStats(getMockHourly());
                setDoctorStats(getMockDoctors());
                setDailyStats(getMockDaily());
                setStatsLoading(false);
                setLoading(false);
            }, 500);
            return;
        }

        // API thật
        try {
            const [summaryData, hourlyData, doctorData, dailyData] = await Promise.all([
                receptionistApi.getStatisticsByPeriod(period),
                receptionistApi.getHourlyStatistics(),
                receptionistApi.getDoctorStatistics(),
                receptionistApi.getDailyStatistics(),
            ]);
            setSummary(summaryData);
            setHourlyStats(Array.isArray(hourlyData) ? hourlyData : []);
            setDoctorStats(Array.isArray(doctorData) ? doctorData : []);
            setDailyStats(Array.isArray(dailyData) ? dailyData : []);
        } catch (error) {
            toast.error(t('statistics.loadError'));
        } finally {
            setStatsLoading(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatistics();
    }, [period]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 mb-6">
                    <h1 className="text-2xl font-bold text-white">📊 {t('statistics.title')}</h1>
                    <p className="text-blue-100 mt-1">{t('statistics.subtitle')}</p>
                </div>

                {/* Period Filter */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 mb-6 flex flex-wrap gap-2">
                    {periods.map((p) => (
                        <Button
                            key={p.value}
                            onClick={() => setPeriod(p.value)}
                            variant={period === p.value ? 'primary' : 'outline'}
                            size="sm"
                            rounded='lg'
                            className="px-4 py-2"
                        >
                            {p.label}
                        </Button>
                    ))}
                </div>

                {/* Summary Cards - có statsLoading riêng */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm">
                        {statsLoading ? (
                            <div className="text-2xl font-bold animate-pulse">...</div>
                        ) : (
                            <div className="text-2xl font-bold text-gray-700 dark:text-white">{summary?.totalAppointments || 0}</div>
                        )}
                        <div className="text-sm text-gray-500">{t('statistics.totalAppointments')}</div>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm">
                        {statsLoading ? (
                            <div className="text-2xl font-bold animate-pulse">...</div>
                        ) : (
                            <div className="text-2xl font-bold text-green-600">{summary?.checkedIn || 0}</div>
                        )}
                        <div className="text-sm text-gray-500">{t('statistics.checkedIn')}</div>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm">
                        {statsLoading ? (
                            <div className="text-2xl font-bold animate-pulse">...</div>
                        ) : (
                            <div className="text-2xl font-bold text-yellow-600">{summary?.waiting || 0}</div>
                        )}
                        <div className="text-sm text-gray-500">{t('statistics.waiting')}</div>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm">
                        {statsLoading ? (
                            <div className="text-2xl font-bold animate-pulse">...</div>
                        ) : (
                            <div className="text-2xl font-bold text-red-600">{summary?.cancelled || 0}</div>
                        )}
                        <div className="text-sm text-gray-500">{t('statistics.cancelled')}</div>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm">
                        {statsLoading ? (
                            <div className="text-2xl font-bold animate-pulse">...</div>
                        ) : (
                            <div className="text-2xl font-bold text-blue-600">{summary?.checkInRate || 0}%</div>
                        )}
                        <div className="text-sm text-gray-500">{t('statistics.checkInRate')}</div>
                    </div>
                </div>

                {/* Loading cho phần còn lại */}
                {loading ? (
                    <div className="py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : (
                    <>
                        {/* Progress Bar */}
                        <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 mb-6">
                            <div className="flex justify-between text-sm mb-1">
                                <span>{t('statistics.checkInRate')}</span>
                                <span>{summary?.checkInRate || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${summary?.checkInRate || 0}%` }}
                                />
                            </div>
                        </div>

                        {/* Two columns layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* Hourly Statistics */}
                            <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    📈 {t('statistics.hourlyChart')}
                                </h3>
                                {safeMap(hourlyStats, (stat) => (
                                    <div key={stat.hour} className="flex items-center gap-2 mb-2">
                                        <div className="w-12 text-sm font-medium text-gray-600">{stat.hour}:00</div>
                                        <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 text-xs text-white flex items-center justify-end pr-2"
                                                style={{ width: `${Math.min(100, (stat.total / 50) * 100)}%` }}
                                            >
                                                {stat.total > 0 && stat.total}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Doctor Ranking */}
                            <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    👨‍⚕️ {t('statistics.doctorRanking')}
                                </h3>
                                {safeMap(doctorStats, (doctor, idx) => (
                                    <div key={doctor.doctorId} className="flex items-center justify-between border-b pb-2 mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 text-lg font-bold text-gray-400">#{idx + 1}</span>
                                            <span className="font-medium text-gray-800 dark:text-white">{doctor.doctorName}</span>
                                        </div>
                                        <div className="flex gap-4 text-sm">
                                            <span className="text-green-600">✅ {doctor.checkedInPatients}</span>
                                            <span className="text-gray-500">📋 {doctor.totalPatients}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Daily Statistics Table */}
                        <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                📅 {t('statistics.dailyChart')}
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100 dark:bg-gray-700">
                                        <tr>
                                            <th className="p-2 text-left">{t('statistics.date')}</th>
                                            <th className="p-2 text-center">{t('statistics.totalAppointments')}</th>
                                            <th className="p-2 text-center">{t('statistics.checkedIn')}</th>
                                            <th className="p-2 text-center">{t('statistics.waiting')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {safeMap(dailyStats, (stat) => (
                                            <tr key={stat.date} className="border-b">
                                                <td className="p-2">{stat.date}</td>
                                                <td className="p-2 text-center">{stat.total}</td>
                                                <td className="p-2 text-center text-green-600">{stat.checkedIn}</td>
                                                <td className="p-2 text-center text-yellow-600">{stat.waiting}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReceptionistStatistics;