import { DoctorStatus, ReceptionistStatus, AppointmentStatus } from '../../core/constants/enums';
import type { ManagerDashboardStats, ReceptionistForManager} from '../../core/types';
import type { AppointmentTodayResponse, TopDoctorResponse, WeeklyStatResponse } from '../../core/types/api.response';

export const USE_MOCK_MANAGER = false; 

// ==================== DASHBOARD STATS ====================
export const mockDashboardStats: ManagerDashboardStats = {
  totalDoctors: 24,
  totalDoctorsChange: 8.2,
  totalReceptionists: 6,
  totalReceptionistsChange: 0,
  totalAppointmentsToday: 42,
  totalAppointmentsTodayChange: 6.5,
  revenueThisMonth: 124500000,
  revenueThisMonthChange: 12.5,
};

// ==================== PENDING DOCTORS ====================
export const mockPendingDoctors = [
  {
    id: 'doctor-1',
    doctorCode: 'DOC-2024-001',
    fullName: 'Nguyễn Văn B',
    email: 'nguyenvanb@example.com',
    phone: '0912345678',
    degree: 'Bác sĩ Chuyên khoa I',
    experienceYears: 8,
    biography: 'Chuyên khoa Nội tim mạch',
    specialtyName: 'Tim mạch',
    departmentName: 'Nội khoa',
    status: DoctorStatus.VERIFIED,
    cvUrl: 'https://example.com/cv/doctor-1.pdf',
    createdAt: '2026-05-02T10:30:00',
    updatedAt: '2026-05-02T10:30:00',
  },
  {
    id: 'doctor-2',
    doctorCode: 'DOC-2024-002',
    fullName: 'Lê Thị C',
    email: 'lethic@example.com',
    phone: '0987654321',
    degree: 'Thạc sĩ',
    experienceYears: 5,
    biography: 'Chuyên khoa Nhi',
    specialtyName: 'Nhi khoa',
    departmentName: 'Nhi khoa',
    status: DoctorStatus.VERIFIED,
    cvUrl: 'https://example.com/cv/doctor-2.pdf',
    createdAt: '2026-05-03T14:20:00',
    updatedAt: '2026-05-03T14:20:00',
  },
  {
    id: 'doctor-3',
    doctorCode: 'DOC-2024-003',
    fullName: 'Phạm Văn D',
    email: 'phamvand@example.com',
    phone: '0978123456',
    degree: 'Bác sĩ Chuyên khoa II',
    experienceYears: 12,
    biography: 'Chuyên khoa Ngoại tổng quát',
    specialtyName: 'Ngoại khoa',
    departmentName: 'Ngoại khoa',
    status: DoctorStatus.VERIFIED,
    cvUrl: 'https://example.com/cv/doctor-3.pdf',
    createdAt: '2026-05-05T09:15:00',
    updatedAt: '2026-05-05T09:15:00',
  },
];

// ==================== PENDING RECEPTIONISTS ====================
export const mockPendingReceptionists: ReceptionistForManager[] = [
  {
    id: 'receptionist-1',
    receptionistCode: 'REC-2024-001',
    fullName: 'Trần Thị E',
    email: 'tranthie@example.com',
    phone: '0912345671',
    hospitalName: "abc",
    status: ReceptionistStatus.VERIFIED,
    cvUrl: 'https://example.com/cv/receptionist-1.pdf',
    createdAt: '2026-05-04T11:00:00',
    updatedAt: '2026-05-04T11:00:00',
  },
  {
    id: 'receptionist-2',
    receptionistCode: 'REC-2024-002',
    fullName: 'Hoàng Thị F',
    email: 'hoangthif@example.com',
    phone: '0987654322',
    hospitalName: "abc",
    status: ReceptionistStatus.VERIFIED,
    cvUrl: 'https://example.com/cv/receptionist-2.pdf',
    createdAt: '2026-05-06T08:30:00',
    updatedAt: '2026-05-06T08:30:00',
  },
];

// ==================== TODAY APPOINTMENTS ====================
export const mockTodayAppointments: AppointmentTodayResponse[] = [
  {
    id: 'appointment-1',
    patientName: 'Nguyễn Thị D',
    patientPhone: '0912345679',
    doctorName: 'BS. Trần Văn C',
    doctorId: 'doctor-4',
    startTime: '08:00',
    endTime: '08:30',
    appointmentDate: '2026-05-06',
    symptoms: 'Đau ngực, khó thở',
    status: AppointmentStatus.CONFIRMED,
    paid: true,
    price: 500000,
    roomNumber: 'Phòng 201',
  },
  {
    id: 'appointment-2',
    patientName: 'Trần Văn F',
    patientPhone: '0987654323',
    doctorName: 'BS. Lê Văn E',
    doctorId: 'doctor-5',
    startTime: '09:00',
    endTime: '09:30',
    appointmentDate: '2026-05-06',
    symptoms: 'Đau bụng, buồn nôn',
    status: AppointmentStatus.CONFIRMED,
    paid: false,
    price: 450000,
    roomNumber: 'Phòng 202',
  },
  {
    id: 'appointment-3',
    patientName: 'Lê Văn H',
    patientPhone: '0912345680',
    doctorName: 'BS. Nguyễn Thị G',
    doctorId: 'doctor-6',
    startTime: '10:00',
    endTime: '10:30',
    appointmentDate: '2026-05-06',
    symptoms: 'Kiểm tra sức khỏe định kỳ',
    status: AppointmentStatus.CONFIRMED,
    paid: true,
    price: 300000,
    roomNumber: 'Phòng 203',
  },
  {
    id: 'appointment-4',
    patientName: 'Phạm Thị I',
    patientPhone: '0978123457',
    doctorName: 'BS. Trần Văn C',
    doctorId: 'doctor-4',
    startTime: '10:30',
    endTime: '11:00',
    appointmentDate: '2026-05-06',
    symptoms: 'Hoa mắt, chóng mặt',
    status: AppointmentStatus.CONFIRMED,
    paid: true,
    price: 500000,
    roomNumber: 'Phòng 201',
  },
];

// ==================== WEEKLY STATISTICS ====================
export const mockWeeklyStats: WeeklyStatResponse[] = [
  { day: 'Thứ 2', dayOfWeek: 8, count: 38 },
  { day: 'Thứ 3', dayOfWeek: 2, count: 42 },
  { day: 'Thứ 4', dayOfWeek: 3, count: 45 },
  { day: 'Thứ 5', dayOfWeek: 4, count: 48 },
  { day: 'Thứ 6', dayOfWeek: 5, count: 52 },
  { day: 'Thứ 7', dayOfWeek: 6, count: 35 },
  { day: 'Chủ nhật', dayOfWeek: 7, count: 28 },
];

// ==================== TOP DOCTORS ====================
export const mockTopDoctors: TopDoctorResponse[] = [
  {
    doctorId: 'doctor-top-1',
    doctorName: 'BS. Nguyễn Văn A',
    specialtyName: 'Tim mạch',

    totalRevenueCollected: 85000000,
    totalRevenueCompleted: 78000000,
    totalPatientsCompleted: 156,
    totalBookingsPaid: 170,

    averageRating: 4.9,
    rank: 1,
  },
  {
    doctorId: 'doctor-top-2',
    doctorName: 'BS. Trần Văn B',
    specialtyName: 'Nội tổng hợp',

    totalRevenueCollected: 76000000,
    totalRevenueCompleted: 71000000,
    totalPatientsCompleted: 142,
    totalBookingsPaid: 155,

    averageRating: 4.7,
    rank: 2,
  },
  {
    doctorId: 'doctor-top-3',
    doctorName: 'BS. Lê Thị C',
    specialtyName: 'Nhi khoa',

    totalRevenueCollected: 69000000,
    totalRevenueCompleted: 64000000,
    totalPatientsCompleted: 128,
    totalBookingsPaid: 140,

    averageRating: 4.8,
    rank: 3,
  },
  {
    doctorId: 'doctor-top-4',
    doctorName: 'BS. Phạm Văn D',
    specialtyName: 'Ngoại khoa',

    totalRevenueCollected: 105000000,
    totalRevenueCompleted: 98000000,
    totalPatientsCompleted: 98,
    totalBookingsPaid: 110,

    averageRating: 4.6,
    rank: 4,
  },
  {
    doctorId: 'doctor-top-5',
    doctorName: 'BS. Hoàng Thị E',
    specialtyName: 'Da liễu',

    totalRevenueCollected: 47000000,
    totalRevenueCompleted: 43500000,
    totalPatientsCompleted: 87,
    totalBookingsPaid: 95,

    averageRating: 4.8,
    rank: 5,
  },
];

// ==================== ROOMS ====================
export const mockRooms = [
  { id: 'room-1', roomNumber: '101', floor: 1, building: 'A', status: 'AVAILABLE' },
  { id: 'room-2', roomNumber: '102', floor: 1, building: 'A', status: 'AVAILABLE' },
  { id: 'room-3', roomNumber: '201', floor: 2, building: 'A', status: 'OCCUPIED' },
  { id: 'room-4', roomNumber: '202', floor: 2, building: 'A', status: 'AVAILABLE' },
  { id: 'room-5', roomNumber: '203', floor: 2, building: 'A', status: 'MAINTENANCE' },
];

// ==================== FETCH FUNCTIONS ====================
export const fetchManagerDashboardStats = async (): Promise<ManagerDashboardStats> => {
  if (USE_MOCK_MANAGER) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockDashboardStats;
  }
  // TODO: Gọi API thật
  throw new Error('API not implemented yet');
};

export const fetchPendingDoctors = async (): Promise<typeof mockPendingDoctors> => {
  if (USE_MOCK_MANAGER) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockPendingDoctors;
  }
  throw new Error('API not implemented yet');
};

export const fetchPendingReceptionists = async (): Promise<ReceptionistForManager[]> => {
  if (USE_MOCK_MANAGER) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockPendingReceptionists;
  }
  throw new Error('API not implemented yet');
};

export const fetchTodayAppointments = async (): Promise<AppointmentTodayResponse[]> => {
  if (USE_MOCK_MANAGER) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTodayAppointments;
  }
  throw new Error('API not implemented yet');
};

export const fetchWeeklyStats = async (): Promise<WeeklyStatResponse[]> => {
  if (USE_MOCK_MANAGER) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockWeeklyStats;
  }
  throw new Error('API not implemented yet');
};

export const fetchTopDoctors = async (): Promise<TopDoctorResponse[]> => {
  if (USE_MOCK_MANAGER) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTopDoctors;
  }
  throw new Error('API not implemented yet');
};

export const fetchRooms = async () => {
  if (USE_MOCK_MANAGER) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockRooms;
  }
  throw new Error('API not implemented yet');
};