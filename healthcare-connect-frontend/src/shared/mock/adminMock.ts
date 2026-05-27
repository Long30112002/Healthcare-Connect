import type { DashboardStats, TopHospital, UserTrend } from "../../core/types";
import type { PendingDoctor } from "../../infrastructure/api/adminApi";

export const USE_MOCK_ADMIN = true;

export const mockDashboardStats: DashboardStats = {
  // 4 stat cards
  totalUsers: 12458,
  totalUsersChange: 12.5,
  totalDoctors: 342,
  totalDoctorsChange: 8.3,
  totalHospitals: 28,
  totalHospitalsChange: 0,
  totalBookings: 15678,
  totalBookingsChange: 23.4,
  
  // Booking overview
  todayBookings: 47,
  weekBookings: 312,
  monthBookings: 1245,
  paymentRate: 78.5,
  cancelRate: 5.2,
  noShowRate: 3.8,
};

// ==================== TOP HOSPITALS ====================

export const mockTopHospitals: TopHospital[] = [
  {
    id: 'hospital-001',
    name: 'Bệnh viện Đa khoa Xuyên Á',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    doctorCount: 45,
    bookingCount: 1234,
    revenue: 456700000,
    rank: 1,
  },
  {
    id: 'hospital-002',
    name: 'Bệnh viện Quốc tế City',
    address: '456 Lê Lợi, Quận 3, TP.HCM',
    doctorCount: 32,
    bookingCount: 890,
    revenue: 234500000,
    rank: 2,
  },
  {
    id: 'hospital-003',
    name: 'Phòng khám Đa khoa Medic',
    address: '789 CMT8, Quận 10, TP.HCM',
    doctorCount: 18,
    bookingCount: 567,
    revenue: 123400000,
    rank: 3,
  },
  {
    id: 'hospital-004',
    name: 'Bệnh viện Nhi Đồng',
    address: '234 Nguyễn Trãi, Quận 5, TP.HCM',
    doctorCount: 25,
    bookingCount: 678,
    revenue: 187600000,
    rank: 4,
  },
  {
    id: 'hospital-005',
    name: 'Bệnh viện Tim mạch',
    address: '567 Hồng Bàng, Quận 5, TP.HCM',
    doctorCount: 20,
    bookingCount: 445,
    revenue: 156700000,
    rank: 5,
  },
];

// ==================== USER TREND (12 tháng gần nhất) ====================

export const mockUserTrend: UserTrend[] = [
  { month: 6, year: 2024, count: 145 },
  { month: 7, year: 2024, count: 178 },
  { month: 8, year: 2024, count: 234 },
  { month: 9, year: 2024, count: 289 },
  { month: 10, year: 2024, count: 312 },
  { month: 11, year: 2024, count: 298 },
  { month: 12, year: 2024, count: 356 },
  { month: 1, year: 2025, count: 423 },
  { month: 2, year: 2025, count: 389 },
  { month: 3, year: 2025, count: 456 },
  { month: 4, year: 2025, count: 498 },
  { month: 5, year: 2025, count: 467 },
];

// ==================== PENDING DOCTORS ====================

export const mockPendingDoctors: PendingDoctor[] = [
  {
    id: 'doctor-pending-001',
    doctorCode: 'DOC-2025-001',
    fullName: 'Nguyễn Văn An',
    email: 'nguyenvana@email.com',
    phone: '0912345678',
    degree: 'Tiến sĩ, Bác sĩ Chuyên khoa II',
    experienceYears: 15,
    biography: 'Chuyên gia về tim mạch với 15 năm kinh nghiệm tại bệnh viện Tim mạch TP.HCM',
    consultationFee: 500000,
    specialtyName: 'Tim mạch',
    departmentName: 'Khoa Nội',
    hospitalId: 'hospital-001',
    hospitalName: 'Bệnh viện Đa khoa Xuyên Á',
    hospitalAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    status: 'PENDING',
    cvUrl: 'https://example.com/cv/an_nguyen.pdf',
    rejectionReason: null,
    rejectionNote: null,
    createdAt: '2025-05-20T08:00:00',
    updatedAt: '2025-05-20T08:00:00',
  },
  {
    id: 'doctor-pending-002',
    doctorCode: 'DOC-2025-002',
    fullName: 'Trần Thị Bích',
    email: 'tranbich@email.com',
    phone: '0987654321',
    degree: 'Thạc sĩ, Bác sĩ Chuyên khoa I',
    experienceYears: 8,
    biography: 'Chuyên khoa Nhi, tốt nghiệp Đại học Y Dược TP.HCM',
    consultationFee: 350000,
    specialtyName: 'Nhi khoa',
    departmentName: 'Khoa Nhi',
    hospitalId: 'hospital-002',
    hospitalName: 'Bệnh viện Quốc tế City',
    hospitalAddress: '456 Lê Lợi, Quận 3, TP.HCM',
    status: 'PENDING',
    cvUrl: 'https://example.com/cv/tran_bich.pdf',
    rejectionReason: null,
    rejectionNote: null,
    createdAt: '2025-05-21T10:30:00',
    updatedAt: '2025-05-21T10:30:00',
  },
  {
    id: 'doctor-pending-003',
    doctorCode: 'DOC-2025-003',
    fullName: 'Lê Hoàng Long',
    email: 'lehoanglong@email.com',
    phone: '0934567890',
    degree: 'Bác sĩ Nội trú',
    experienceYears: 5,
    biography: 'Chuyên khoa Da liễu - Thẩm mỹ da',
    consultationFee: 400000,
    specialtyName: 'Da liễu',
    departmentName: 'Khoa Da liễu',
    hospitalId: 'hospital-003',
    hospitalName: 'Phòng khám Đa khoa Medic',
    hospitalAddress: '789 CMT8, Quận 10, TP.HCM',
    status: 'PENDING',
    cvUrl: 'https://example.com/cv/le_long.pdf',
    rejectionReason: null,
    rejectionNote: null,
    createdAt: '2025-05-22T14:15:00',
    updatedAt: '2025-05-22T14:15:00',
  },
  {
    id: 'doctor-pending-004',
    doctorCode: 'DOC-2025-004',
    fullName: 'Phạm Thị Mai',
    email: 'phamthimai@email.com',
    phone: '0978123456',
    degree: 'Phó giáo sư, Tiến sĩ',
    experienceYears: 20,
    biography: 'Chuyên gia đầu ngành về Sản phụ khoa',
    consultationFee: 800000,
    specialtyName: 'Sản phụ khoa',
    departmentName: 'Khoa Sản',
    hospitalId: 'hospital-001',
    hospitalName: 'Bệnh viện Đa khoa Xuyên Á',
    hospitalAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    status: 'PENDING',
    cvUrl: 'https://example.com/cv/pham_mai.pdf',
    rejectionReason: null,
    rejectionNote: null,
    createdAt: '2025-05-23T09:00:00',
    updatedAt: '2025-05-23T09:00:00',
  },
  {
    id: 'doctor-pending-005',
    doctorCode: 'DOC-2025-005',
    fullName: 'Hoàng Văn Nam',
    email: 'hoangnam@email.com',
    phone: '0945678901',
    degree: 'Bác sĩ Chuyên khoa I',
    experienceYears: 10,
    biography: 'Chuyên khoa Tai Mũi Họng',
    consultationFee: 300000,
    specialtyName: 'Tai Mũi Họng',
    departmentName: 'Khoa Tai Mũi Họng',
    hospitalId: 'hospital-004',
    hospitalName: 'Bệnh viện Nhi Đồng',
    hospitalAddress: '234 Nguyễn Trãi, Quận 5, TP.HCM',
    status: 'PENDING',
    cvUrl: 'https://example.com/cv/hoang_nam.pdf',
    rejectionReason: null,
    rejectionNote: null,
    createdAt: '2025-05-24T11:45:00',
    updatedAt: '2025-05-24T11:45:00',
  },
  {
    id: 'doctor-pending-006',
    doctorCode: 'DOC-2025-006',
    fullName: 'Đặng Thị Hương',
    email: 'danghuong@email.com',
    phone: '0967890123',
    degree: 'Thạc sĩ',
    experienceYears: 7,
    biography: 'Chuyên khoa Mắt - Phẫu thuật Lasik',
    consultationFee: 450000,
    specialtyName: 'Mắt',
    departmentName: 'Khoa Mắt',
    hospitalId: 'hospital-005',
    hospitalName: 'Bệnh viện Tim mạch',
    hospitalAddress: '567 Hồng Bàng, Quận 5, TP.HCM',
    status: 'PENDING',
    cvUrl: 'https://example.com/cv/dang_huong.pdf',
    rejectionReason: null,
    rejectionNote: null,
    createdAt: '2025-05-25T13:20:00',
    updatedAt: '2025-05-25T13:20:00',
  },
  {
    id: 'doctor-pending-007',
    doctorCode: 'DOC-2025-007',
    fullName: 'Vũ Minh Tâm',
    email: 'vuminhtam@email.com',
    phone: '0912340987',
    degree: 'Bác sĩ Chuyên khoa II',
    experienceYears: 12,
    biography: 'Chuyên khoa Cơ xương khớp',
    consultationFee: 380000,
    specialtyName: 'Cơ xương khớp',
    departmentName: 'Khoa Ngoại',
    hospitalId: 'hospital-002',
    hospitalName: 'Bệnh viện Quốc tế City',
    hospitalAddress: '456 Lê Lợi, Quận 3, TP.HCM',
    status: 'PENDING',
    cvUrl: 'https://example.com/cv/vu_tam.pdf',
    rejectionReason: null,
    rejectionNote: null,
    createdAt: '2025-05-26T15:30:00',
    updatedAt: '2025-05-26T15:30:00',
  },
];

// ==================== FLAG DÙNG MOCK HAY REAL API ====================


// ==================== HÀM LẤY MOCK DATA (CÓ DELAY GIẢ LẬP MẠNG) ====================

export const fetchMockDashboardStats = (): Promise<DashboardStats> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockDashboardStats), 500);
  });
};

export const fetchMockTopHospitals = (limit: number = 5): Promise<TopHospital[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockTopHospitals.slice(0, limit)), 500);
  });
};

export const fetchMockUserTrend = (): Promise<UserTrend[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockUserTrend), 500);
  });
};

export const fetchMockPendingDoctors = (): Promise<PendingDoctor[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockPendingDoctors), 500);
  });
};