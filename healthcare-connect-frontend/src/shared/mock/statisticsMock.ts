import type { StatisticsResponse, HourlyStatistic, DoctorStatistic, DailyStatistic } from '../../core/types/api.response';

type Period = 'today' | 'week' | 'month' | 'quarter' | 'halfyear' | 'year';

export const getMockSummary = (period: Period): StatisticsResponse => {
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

export const getMockHourly = (): HourlyStatistic[] => [
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

export const getMockDoctors = (): DoctorStatistic[] => [
    { doctorId: '1', doctorName: 'BS. Nguyễn Văn An', totalPatients: 45, checkedInPatients: 38 },
    { doctorId: '2', doctorName: 'BS. Trần Thị Bình', totalPatients: 38, checkedInPatients: 30 },
    { doctorId: '3', doctorName: 'BS. Lê Văn Cường', totalPatients: 32, checkedInPatients: 25 },
    { doctorId: '4', doctorName: 'BS. Phạm Thị Dung', totalPatients: 28, checkedInPatients: 22 },
    { doctorId: '5', doctorName: 'BS. Hoàng Văn Em', totalPatients: 24, checkedInPatients: 18 },
];

export const getMockDaily = (): DailyStatistic[] => [
    { date: '2026-04-08', total: 28, checkedIn: 18, waiting: 10 },
    { date: '2026-04-09', total: 32, checkedIn: 20, waiting: 12 },
    { date: '2026-04-10', total: 35, checkedIn: 22, waiting: 13 },
    { date: '2026-04-11', total: 30, checkedIn: 19, waiting: 11 },
    { date: '2026-04-12', total: 25, checkedIn: 16, waiting: 9 },
    { date: '2026-04-13', total: 38, checkedIn: 25, waiting: 13 },
    { date: '2026-04-14', total: 42, checkedIn: 28, waiting: 14 },
];