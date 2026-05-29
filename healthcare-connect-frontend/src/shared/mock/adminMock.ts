import type { DashboardStats, TopHospital, UserTrend } from "../../core/types";
import type { AdminUserListResponse, AdminUserDetailResponse, PageResponse, AdminDoctorListResponse, DoctorDetailResponse, DoctorHistoryResponse, AdminHospitalDetailResponse, AdminHospitalListResponse, ReceptionistDetailResponse, ReceptionistHistoryResponse, ReceptionistListResponse, TopDoctorResponse, TopMedicineResponse } from "../../core/types/api.response";
import type { PendingDoctor } from "../../infrastructure/api/adminApi";
import type { RevenueData } from "../../infrastructure/api/statisticsApi";

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

// ==================== MOCK USERS DATA ====================

export const mockUsers: AdminUserListResponse[] = [
  {
    id: 'user-001',
    fullName: 'Nguyễn Văn An',
    email: 'nguyenvana@email.com',
    phone: '0912345678',
    role: 'DOCTOR',
    enabled: true,
    createdAt: '2024-01-15T08:30:00',
  },
  {
    id: 'user-002',
    fullName: 'Trần Thị Bích',
    email: 'tranbich@email.com',
    phone: '0987654321',
    role: 'PATIENT',
    enabled: true,
    createdAt: '2024-02-20T10:15:00',
  },
  {
    id: 'user-003',
    fullName: 'Lê Văn Cường',
    email: 'lecuong@email.com',
    phone: '0934567890',
    role: 'HOSPITAL_MANAGER',
    enabled: true,
    createdAt: '2024-03-10T14:45:00',
  },
  {
    id: 'user-004',
    fullName: 'Phạm Thị Dung',
    email: 'phamdung@email.com',
    phone: '0978123456',
    role: 'RECEPTIONIST',
    enabled: false,
    createdAt: '2024-04-05T09:20:00',
  },
  {
    id: 'user-005',
    fullName: 'Hoàng Văn Em',
    email: 'hoangem@email.com',
    phone: '0945678901',
    role: 'PATIENT',
    enabled: true,
    createdAt: '2024-05-12T16:00:00',
  },
  {
    id: 'user-006',
    fullName: 'Vũ Thị Phượng',
    email: 'vuphuong@email.com',
    phone: '0967890123',
    role: 'DOCTOR',
    enabled: true,
    createdAt: '2024-06-18T11:30:00',
  },
  {
    id: 'user-007',
    fullName: 'Đặng Văn Hùng',
    email: 'danghung@email.com',
    phone: '0912340987',
    role: 'ADMIN',
    enabled: true,
    createdAt: '2024-07-22T13:10:00',
  },
  {
    id: 'user-008',
    fullName: 'Bùi Thị Lan',
    email: 'builan@email.com',
    phone: '0987012345',
    role: 'RECEPTIONIST',
    enabled: true,
    createdAt: '2024-08-30T08:00:00',
  },
  {
    id: 'user-009',
    fullName: 'Trịnh Quốc Bảo',
    email: 'trinhbao@email.com',
    phone: '0932123456',
    role: 'PATIENT',
    enabled: false,
    createdAt: '2024-09-14T15:30:00',
  },
  {
    id: 'user-010',
    fullName: 'Lý Thị Hồng',
    email: 'lyhong@email.com',
    phone: '0976543210',
    role: 'HOSPITAL_MANAGER',
    enabled: true,
    createdAt: '2024-10-25T10:45:00',
  },
  {
    id: 'user-011',
    fullName: 'Mai Văn Tuấn',
    email: 'maituan@email.com',
    phone: '0943210987',
    role: 'DOCTOR',
    enabled: true,
    createdAt: '2024-11-08T14:20:00',
  },
  {
    id: 'user-012',
    fullName: 'Hà Thị Nga',
    email: 'hanga@email.com',
    phone: '0935678901',
    role: 'PATIENT',
    enabled: true,
    createdAt: '2024-12-01T09:15:00',
  },
];

// ==================== MOCK USER DETAIL ====================

export const mockUserDetails: Record<string, AdminUserDetailResponse> = {
  'user-001': {
    id: 'user-001',
    fullName: 'Nguyễn Văn An',
    email: 'nguyenvana@email.com',
    phone: '0912345678',
    role: 'DOCTOR',
    enabled: true,
    createdAt: '2024-01-15T08:30:00',
    doctorInfo: {
      doctorId: 'doc-001',
      doctorCode: 'DOC-2024-001',
      specialtyName: 'Tim mạch',
      departmentName: 'Khoa Nội',
      hospitalId: 'hospital-001',
      hospitalName: 'Bệnh viện Đa khoa Xuyên Á',
      hospitalAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      experienceYears: 15,
      degree: 'Tiến sĩ, Bác sĩ Chuyên khoa II',
      biography: 'Chuyên gia về tim mạch với 15 năm kinh nghiệm',
      consultationFee: 500000,
      cvUrl: 'https://example.com/cv/an_nguyen.pdf',
      status: 'APPROVED',
      verifiedAt: '2024-01-20T09:00:00',
      approvedAt: '2024-01-25T14:30:00',
    },
  },
  'user-002': {
    id: 'user-002',
    fullName: 'Trần Thị Bích',
    email: 'tranbich@email.com',
    phone: '0987654321',
    role: 'PATIENT',
    enabled: true,
    createdAt: '2024-02-20T10:15:00',
  },
  'user-003': {
    id: 'user-003',
    fullName: 'Lê Văn Cường',
    email: 'lecuong@email.com',
    phone: '0934567890',
    role: 'HOSPITAL_MANAGER',
    enabled: true,
    createdAt: '2024-03-10T14:45:00',
    managerInfo: {
      hospitalId: 'hospital-001',
      hospitalName: 'Bệnh viện Đa khoa Xuyên Á',
      hospitalAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      hospitalPhone: '028 1234 5678',
      hospitalEmail: 'contact@benhvienxuana.com',
      acceptedAt: '2024-03-11T10:00:00',
    },
  },
  'user-004': {
    id: 'user-004',
    fullName: 'Phạm Thị Dung',
    email: 'phamdung@email.com',
    phone: '0978123456',
    role: 'RECEPTIONIST',
    enabled: false,
    createdAt: '2024-04-05T09:20:00',
    receptionistInfo: {
      receptionistId: 'rec-001',
      receptionistCode: 'REC-2024-001',
      hospitalId: 'hospital-002',
      hospitalName: 'Bệnh viện Quốc tế City',
      hospitalAddress: '456 Lê Lợi, Quận 3, TP.HCM',
      cvUrl: 'https://example.com/cv/pham_dung.pdf',
      status: 'APPROVED',
      verifiedAt: '2024-04-10T11:00:00',
      approvedAt: '2024-04-15T09:30:00',
    },
  },
  'user-005': {
    id: 'user-005',
    fullName: 'Hoàng Văn Em',
    email: 'hoangem@email.com',
    phone: '0945678901',
    role: 'PATIENT',
    enabled: true,
    createdAt: '2024-05-12T16:00:00',
  },
  'user-006': {
    id: 'user-006',
    fullName: 'Vũ Thị Phượng',
    email: 'vuphuong@email.com',
    phone: '0967890123',
    role: 'DOCTOR',
    enabled: true,
    createdAt: '2024-06-18T11:30:00',
    doctorInfo: {
      doctorId: 'doc-002',
      doctorCode: 'DOC-2024-002',
      specialtyName: 'Nhi khoa',
      departmentName: 'Khoa Nhi',
      hospitalId: 'hospital-002',
      hospitalName: 'Bệnh viện Quốc tế City',
      hospitalAddress: '456 Lê Lợi, Quận 3, TP.HCM',
      experienceYears: 8,
      degree: 'Thạc sĩ, Bác sĩ Chuyên khoa I',
      biography: 'Chuyên khoa Nhi, tốt nghiệp Đại học Y Dược TP.HCM',
      consultationFee: 350000,
      cvUrl: 'https://example.com/cv/vu_phuong.pdf',
      status: 'APPROVED',
      verifiedAt: '2024-06-25T10:00:00',
      approvedAt: '2024-07-01T14:00:00',
    },
  },
};

// ==================== MOCK FETCH FUNCTIONS ====================

export const fetchMockUsers = (
  page: number = 0,
  size: number = 10,
  keyword?: string,
  role?: string,
  enabled?: boolean,
  sortBy?: string,
  sortDir?: string
): Promise<PageResponse<AdminUserListResponse>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockUsers];

      // Lọc theo keyword
      if (keyword) {
        const lowerKeyword = keyword.toLowerCase();
        filtered = filtered.filter(
          (user) =>
            user.fullName.toLowerCase().includes(lowerKeyword) ||
            user.email.toLowerCase().includes(lowerKeyword)
        );
      }

      // Lọc theo role
      if (role && role !== 'ALL') {
        filtered = filtered.filter((user) => user.role === role);
      }

      // Lọc theo enabled status
      if (enabled !== undefined) {
        filtered = filtered.filter((user) => user.enabled === enabled);
      }

      // Sắp xếp
      if (sortBy === 'fullName') {
        filtered.sort((a, b) => {
          const comparison = a.fullName.localeCompare(b.fullName);
          return sortDir === 'asc' ? comparison : -comparison;
        });
      } else if (sortBy === 'email') {
        filtered.sort((a, b) => {
          const comparison = a.email.localeCompare(b.email);
          return sortDir === 'asc' ? comparison : -comparison;
        });
      } else if (sortBy === 'createdAt') {
        filtered.sort((a, b) => {
          const comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          return sortDir === 'asc' ? comparison : -comparison;
        });
      }

      // Phân trang
      const start = page * size;
      const end = start + size;
      const content = filtered.slice(start, end);

      resolve({
        content,
        totalPages: Math.ceil(filtered.length / size),
        totalElements: filtered.length,
        size,
        number: page,
        first: page === 0,
        last: end >= filtered.length,
        empty: content.length === 0,
        pageable: {
          pageNumber: page,
          pageSize: size,
          sort: { empty: true, sorted: false, unsorted: true },
          offset: page * size,
          paged: true,
          unpaged: false,
        },
        sort: { empty: true, sorted: false, unsorted: true },
        numberOfElements: content.length,
      });
    }, 500);
  });
};
export const fetchMockUserDetail = (userId: string): Promise<AdminUserDetailResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userDetail = mockUserDetails[userId];
      if (userDetail) {
        resolve(userDetail);
      } else {
        reject(new Error('User not found'));
      }
    }, 500);
  });
};

// ==================== MOCK DOCTORS DATA ====================

export const mockDoctors: AdminDoctorListResponse[] = [
  {
    id: 'doctor-001',
    doctorCode: 'DOC-2024-001',
    fullName: 'Nguyễn Văn An',
    email: 'nguyenvana@email.com',
    phone: '0912345678',
    specialtyName: 'Tim mạch',
    departmentName: 'Khoa Nội',
    hospitalName: 'Bệnh viện Đa khoa Xuyên Á',
    hospitalId: 'hospital-001',
    experienceYears: 15,
    consultationFee: 500000,
    status: 'PENDING',
    createdAt: '2024-01-15T08:30:00',
  },
  {
    id: 'doctor-002',
    doctorCode: 'DOC-2024-002',
    fullName: 'Trần Thị Bích',
    email: 'tranbich@email.com',
    phone: '0987654321',
    specialtyName: 'Nhi khoa',
    departmentName: 'Khoa Nhi',
    hospitalName: 'Bệnh viện Quốc tế City',
    hospitalId: 'hospital-002',
    experienceYears: 8,
    consultationFee: 350000,
    status: 'VERIFIED',
    createdAt: '2024-02-20T10:15:00',
  },
  {
    id: 'doctor-003',
    doctorCode: 'DOC-2024-003',
    fullName: 'Lê Văn Cường',
    email: 'lecuong@email.com',
    phone: '0934567890',
    specialtyName: 'Da liễu',
    departmentName: 'Khoa Da liễu',
    hospitalName: 'Phòng khám Đa khoa Medic',
    hospitalId: 'hospital-003',
    experienceYears: 12,
    consultationFee: 400000,
    status: 'APPROVED',
    createdAt: '2024-03-10T14:45:00',
  },
  {
    id: 'doctor-004',
    doctorCode: 'DOC-2024-004',
    fullName: 'Phạm Thị Dung',
    email: 'phamdung@email.com',
    phone: '0978123456',
    specialtyName: 'Mắt',
    departmentName: 'Khoa Mắt',
    hospitalName: 'Bệnh viện Đa khoa Xuyên Á',
    hospitalId: 'hospital-001',
    experienceYears: 10,
    consultationFee: 450000,
    status: 'REJECTED',
    createdAt: '2024-04-05T09:20:00',
  },
  {
    id: 'doctor-005',
    doctorCode: 'DOC-2024-005',
    fullName: 'Hoàng Văn Em',
    email: 'hoangem@email.com',
    phone: '0945678901',
    specialtyName: 'Tai Mũi Họng',
    departmentName: 'Khoa Tai Mũi Họng',
    hospitalName: 'Bệnh viện Quốc tế City',
    hospitalId: 'hospital-002',
    experienceYears: 6,
    consultationFee: 300000,
    status: 'PENDING',
    createdAt: '2024-05-12T16:00:00',
  },
];

// ==================== MOCK DOCTOR DETAIL ====================

export const mockDoctorDetails: Record<string, DoctorDetailResponse> = {
  'doctor-001': {
    id: 'doctor-001',
    doctorCode: 'DOC-2024-001',
    fullName: 'Nguyễn Văn An',
    email: 'nguyenvana@email.com',
    phone: '0912345678',
    degree: 'Tiến sĩ, Bác sĩ Chuyên khoa II',
    experienceYears: 15,
    biography: 'Chuyên gia về tim mạch với 15 năm kinh nghiệm tại bệnh viện Tim mạch TP.HCM. Đã thực hiện thành công nhiều ca phẫu thuật tim phức tạp.',
    consultationFee: 500000,
    specialtyName: 'Tim mạch',
    departmentName: 'Khoa Nội',
    hospitalId: 'hospital-001',
    hospitalName: 'Bệnh viện Đa khoa Xuyên Á',
    hospitalAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    status: 'PENDING',
    cvUrl: 'https://example.com/cv/an_nguyen.pdf',
    createdAt: '2024-01-15T08:30:00',
    updatedAt: '2024-01-15T08:30:00',
  },
  'doctor-002': {
    id: 'doctor-002',
    doctorCode: 'DOC-2024-002',
    fullName: 'Trần Thị Bích',
    email: 'tranbich@email.com',
    phone: '0987654321',
    degree: 'Thạc sĩ, Bác sĩ Chuyên khoa I',
    experienceYears: 8,
    biography: 'Chuyên khoa Nhi, tốt nghiệp Đại học Y Dược TP.HCM. Đam mê chăm sóc sức khỏe trẻ em.',
    consultationFee: 350000,
    specialtyName: 'Nhi khoa',
    departmentName: 'Khoa Nhi',
    hospitalId: 'hospital-002',
    hospitalName: 'Bệnh viện Quốc tế City',
    hospitalAddress: '456 Lê Lợi, Quận 3, TP.HCM',
    status: 'VERIFIED',
    cvUrl: 'https://example.com/cv/tran_bich.pdf',
    createdAt: '2024-02-20T10:15:00',
    updatedAt: '2024-02-25T09:00:00',
  },
};

// ==================== MOCK DOCTOR HISTORY ====================

export const mockDoctorHistories: Record<string, DoctorHistoryResponse[]> = {
  'doctor-001': [
    {
      id: 1,
      doctorId: 'doctor-001',
      actorName: 'Nguyễn Văn An',
      actorRole: 'DOCTOR',
      action: 'CREATE',
      oldStatus: null,
      newStatus: 'PENDING',
      note: 'Nộp hồ sơ đăng ký bác sĩ lần đầu',
      createdAt: '2024-01-15T08:30:00',
    },
  ],
  'doctor-002': [
    {
      id: 1,
      doctorId: 'doctor-002',
      actorName: 'Trần Thị Bích',
      actorRole: 'DOCTOR',
      action: 'CREATE',
      oldStatus: null,
      newStatus: 'PENDING',
      note: 'Nộp hồ sơ đăng ký bác sĩ lần đầu',
      createdAt: '2024-02-20T10:15:00',
    },
    {
      id: 2,
      doctorId: 'doctor-002',
      actorName: 'Admin System',
      actorRole: 'ADMIN',
      action: 'VERIFY',
      oldStatus: 'PENDING',
      newStatus: 'VERIFIED',
      note: 'Admin xác thực hồ sơ bác sĩ',
      createdAt: '2024-02-25T09:00:00',
    },
  ],
};

// ==================== MOCK FETCH FUNCTIONS FOR DOCTORS ====================

export const fetchMockDoctors = (
  page: number = 0,
  size: number = 10,
  keyword?: string,
  status?: string,
  hospitalId?: string,
  sortBy: string = 'createdAt',
  sortDir: string = 'desc'
): Promise<PageResponse<AdminDoctorListResponse>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockDoctors];

      // Lọc theo keyword
      if (keyword) {
        const lowerKeyword = keyword.toLowerCase();
        filtered = filtered.filter(
          (doctor) =>
            doctor.fullName.toLowerCase().includes(lowerKeyword) ||
            doctor.email.toLowerCase().includes(lowerKeyword) ||
            doctor.doctorCode.toLowerCase().includes(lowerKeyword)
        );
      }

      // Lọc theo status
      if (status && status !== 'ALL') {
        filtered = filtered.filter((doctor) => doctor.status === status);
      }

      // Lọc theo bệnh viện
      if (hospitalId && hospitalId !== 'ALL') {
        filtered = filtered.filter((doctor) => doctor.hospitalId === hospitalId);
      }

      // Sắp xếp
      if (sortBy === 'fullName') {
        filtered.sort((a, b) => {
          const comparison = a.fullName.localeCompare(b.fullName);
          return sortDir === 'asc' ? comparison : -comparison;
        });
      } else if (sortBy === 'createdAt') {
        filtered.sort((a, b) => {
          const comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          return sortDir === 'asc' ? comparison : -comparison;
        });
      }

      // Phân trang
      const start = page * size;
      const end = start + size;
      const content = filtered.slice(start, end);

      resolve({
        content,
        totalPages: Math.ceil(filtered.length / size),
        totalElements: filtered.length,
        size,
        number: page,
        first: page === 0,
        last: end >= filtered.length,
        empty: content.length === 0,
        pageable: {
          pageNumber: page,
          pageSize: size,
          sort: { empty: true, sorted: false, unsorted: true },
          offset: page * size,
          paged: true,
          unpaged: false,
        },
        sort: { empty: true, sorted: false, unsorted: true },
        numberOfElements: content.length,
      });
    }, 500);
  });
};

export const fetchMockDoctorDetail = (doctorId: string): Promise<DoctorDetailResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const doctorDetail = mockDoctorDetails[doctorId];
      const history = mockDoctorHistories[doctorId] || [];
      if (doctorDetail) {
        resolve({ ...doctorDetail, history });
      } else {
        reject(new Error('Doctor not found'));
      }
    }, 500);
  });
};

export const fetchMockDoctorHistory = (doctorId: string): Promise<DoctorHistoryResponse[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockDoctorHistories[doctorId] || []);
    }, 500);
  });
};

// ==================== MOCK HOSPITALS DATA ====================

export const mockHospitals: AdminHospitalListResponse[] = [
  {
    id: 'hospital-001',
    name: 'Bệnh viện Đa khoa Xuyên Á',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    hotline: '028 1234 5678',
    email: 'contact@benhvienxuana.com',
    managerName: 'Nguyễn Văn An',
    managerEmail: 'an.nguyen@email.com',
    status: 'ACTIVE',  // ← THÊM DÒNG NÀY
    createdAt: '2024-01-15T08:30:00',
  },
  {
    id: 'hospital-002',
    name: 'Bệnh viện Quốc tế City',
    address: '456 Lê Lợi, Quận 3, TP.HCM',
    hotline: '028 8765 4321',
    email: 'info@cityinternational.com',
    managerName: 'Trần Thị Bích',
    managerEmail: 'bich.tran@email.com',
    status: 'PENDING_CONFIRMATION',  // ← THÊM DÒNG NÀY
    createdAt: '2024-02-20T10:15:00',
  },
  {
    id: 'hospital-003',
    name: 'Phòng khám Đa khoa Medic',
    address: '789 CMT8, Quận 10, TP.HCM',
    hotline: '028 3456 7890',
    email: 'contact@medic.com',
    managerName: 'Lê Văn Cường',
    managerEmail: 'cuong.le@email.com',
    status: 'REJECTED',  // ← THÊM DÒNG NÀY
    createdAt: '2024-03-10T14:45:00',
  },
  {
    id: 'hospital-004',
    name: 'Bệnh viện Nhi Đồng',
    address: '234 Nguyễn Trãi, Quận 5, TP.HCM',
    hotline: '028 9876 5432',
    email: 'info@nhidong.com',
    managerName: 'Phạm Thị Dung',
    managerEmail: 'dung.pham@email.com',
    status: 'PENDING_CONFIRMATION',  // ← THÊM DÒNG NÀY
    createdAt: '2024-04-05T09:20:00',
  },
  {
    id: 'hospital-005',
    name: 'Bệnh viện Tim mạch',
    address: '567 Hồng Bàng, Quận 5, TP.HCM',
    hotline: '028 2345 6789',
    email: 'contact@tim mach.com',
    managerName: 'Hoàng Văn Em',
    managerEmail: 'em.hoang@email.com',
    status: 'ACTIVE',  // ← THÊM DÒNG NÀY
    createdAt: '2024-05-12T16:00:00',
  },
];

export const mockHospitalDetails: Record<string, AdminHospitalDetailResponse> = {
  'hospital-001': {
    id: 'hospital-001',
    name: 'Bệnh viện Đa khoa Xuyên Á',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    hotline: '028 1234 5678',
    email: 'contact@benhvienxuana.com',
    website: 'https://benhvienxuana.com',
    description: 'Bệnh viện đa khoa hàng đầu tại TP.HCM với đội ngũ bác sĩ giàu kinh nghiệm',
    imageUrl: 'https://example.com/images/hospital-001.jpg',
    managerId: 'user-001',
    managerName: 'Nguyễn Văn An',
    managerEmail: 'an.nguyen@email.com',
    status: 'ACTIVE',  // ← THÊM DÒNG NÀY
    createdAt: '2024-01-15T08:30:00',
    updatedAt: '2024-01-15T08:30:00',
    doctorCount: 45,
  },
  'hospital-002': {
    id: 'hospital-002',
    name: 'Bệnh viện Quốc tế City',
    address: '456 Lê Lợi, Quận 3, TP.HCM',
    hotline: '028 8765 4321',
    email: 'info@cityinternational.com',
    website: 'https://cityinternational.com',
    description: 'Bệnh viện quốc tế với trang thiết bị hiện đại',
    imageUrl: 'https://example.com/images/hospital-002.jpg',
    managerId: 'user-002',
    managerName: 'Trần Thị Bích',
    managerEmail: 'bich.tran@email.com',
    status: 'PENDING_CONFIRMATION',  // ← THÊM DÒNG NÀY
    createdAt: '2024-02-20T10:15:00',
    updatedAt: '2024-02-20T10:15:00',
    doctorCount: 32,
  },
  'hospital-003': {
    id: 'hospital-003',
    name: 'Phòng khám Đa khoa Medic',
    address: '789 CMT8, Quận 10, TP.HCM',
    hotline: '028 3456 7890',
    email: 'contact@medic.com',
    website: 'https://medic.com',
    description: 'Phòng khám đa khoa uy tín tại TP.HCM',
    imageUrl: 'https://example.com/images/hospital-003.jpg',
    managerId: 'user-003',
    managerName: 'Lê Văn Cường',
    managerEmail: 'cuong.le@email.com',
    status: 'REJECTED',  // ← THÊM DÒNG NÀY
    createdAt: '2024-03-10T14:45:00',
    updatedAt: '2024-03-10T14:45:00',
    doctorCount: 18,
  },
};

// ==================== MOCK FETCH FUNCTIONS FOR HOSPITALS ====================

export const fetchMockHospitals = (
  page: number = 0,
  size: number = 10,
  keyword?: string,
  sortBy: string = 'createdAt',
  sortDir: string = 'desc'
): Promise<PageResponse<AdminHospitalListResponse>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockHospitals];

      // Lọc theo keyword
      if (keyword) {
        const lowerKeyword = keyword.toLowerCase();
        filtered = filtered.filter(
          (hospital) =>
            hospital.name.toLowerCase().includes(lowerKeyword) ||
            hospital.address.toLowerCase().includes(lowerKeyword)
        );
      }

      // Sắp xếp
      if (sortBy === 'name') {
        filtered.sort((a, b) => {
          const comparison = a.name.localeCompare(b.name);
          return sortDir === 'asc' ? comparison : -comparison;
        });
      } else if (sortBy === 'createdAt') {
        filtered.sort((a, b) => {
          const comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          return sortDir === 'asc' ? comparison : -comparison;
        });
      }

      // Phân trang
      const start = page * size;
      const end = start + size;
      const content = filtered.slice(start, end);

      resolve({
        content,
        totalPages: Math.ceil(filtered.length / size),
        totalElements: filtered.length,
        size,
        number: page,
        first: page === 0,
        last: end >= filtered.length,
        empty: content.length === 0,
        pageable: {
          pageNumber: page,
          pageSize: size,
          sort: { empty: true, sorted: false, unsorted: true },
          offset: page * size,
          paged: true,
          unpaged: false,
        },
        sort: { empty: true, sorted: false, unsorted: true },
        numberOfElements: content.length,
      });
    }, 500);
  });
};

export const fetchMockHospitalDetail = (hospitalId: string): Promise<AdminHospitalDetailResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const detail = mockHospitalDetails[hospitalId];
      if (detail) {
        resolve(detail);
      } else {
        reject(new Error('Hospital not found'));
      }
    }, 500);
  });
};

// ==================== MOCK RECEPTIONISTS DATA ====================

export const mockReceptionists: ReceptionistListResponse[] = [
  {
    id: 'receptionist-001',
    receptionistCode: 'REC-2024-001',
    fullName: 'Nguyễn Thị Anh',
    email: 'anh.nguyen@email.com',
    phone: '0912345678',
    hospitalName: 'Bệnh viện Đa khoa Xuyên Á',
    status: 'PENDING',
    createdAt: '2024-01-15T08:30:00',
  },
  {
    id: 'receptionist-002',
    receptionistCode: 'REC-2024-002',
    fullName: 'Trần Văn Bình',
    email: 'binh.tran@email.com',
    phone: '0987654321',
    hospitalName: 'Bệnh viện Quốc tế City',
    status: 'VERIFIED',
    createdAt: '2024-02-20T10:15:00',
  },
  {
    id: 'receptionist-003',
    receptionistCode: 'REC-2024-003',
    fullName: 'Lê Thị Cúc',
    email: 'cuc.le@email.com',
    phone: '0934567890',
    hospitalName: 'Phòng khám Đa khoa Medic',
    status: 'APPROVED',
    createdAt: '2024-03-10T14:45:00',
  },
  {
    id: 'receptionist-004',
    receptionistCode: 'REC-2024-004',
    fullName: 'Phạm Văn Dũng',
    email: 'dung.pham@email.com',
    phone: '0978123456',
    hospitalName: 'Bệnh viện Đa khoa Xuyên Á',
    status: 'REJECTED',
    createdAt: '2024-04-05T09:20:00',
  },
  {
    id: 'receptionist-005',
    receptionistCode: 'REC-2024-005',
    fullName: 'Hoàng Thị Em',
    email: 'em.hoang@email.com',
    phone: '0945678901',
    hospitalName: 'Bệnh viện Quốc tế City',
    status: 'PENDING',
    createdAt: '2024-05-12T16:00:00',
  },
];

export const mockReceptionistDetails: Record<string, ReceptionistDetailResponse> = {
  'receptionist-001': {
    id: 'receptionist-001',
    receptionistCode: 'REC-2024-001',
    fullName: 'Nguyễn Thị Anh',
    email: 'anh.nguyen@email.com',
    phone: '0912345678',
    hospitalName: 'Bệnh viện Đa khoa Xuyên Á',
    hospitalAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    status: 'PENDING',
    cvUrl: 'https://example.com/cv/anh_nguyen.pdf',
    createdAt: '2024-01-15T08:30:00',
    updatedAt: '2024-01-15T08:30:00',
  },
  'receptionist-002': {
    id: 'receptionist-002',
    receptionistCode: 'REC-2024-002',
    fullName: 'Trần Văn Bình',
    email: 'binh.tran@email.com',
    phone: '0987654321',
    hospitalName: 'Bệnh viện Quốc tế City',
    hospitalAddress: '456 Lê Lợi, Quận 3, TP.HCM',
    status: 'VERIFIED',
    cvUrl: 'https://example.com/cv/van_binh.pdf',
    createdAt: '2024-02-20T10:15:00',
    updatedAt: '2024-02-25T09:00:00',
  },
};

export const mockReceptionistHistories: Record<string, ReceptionistHistoryResponse[]> = {
  'receptionist-001': [
    {
      id: 1,
      receptionistId: 'receptionist-001',
      actorName: 'Nguyễn Thị Anh',
      actorRole: 'RECEPTIONIST',
      action: 'CREATE',
      oldStatus: null,
      newStatus: 'PENDING',
      note: 'Nộp hồ sơ đăng ký lễ tân lần đầu',
      createdAt: '2024-01-15T08:30:00',
    },
  ],
  'receptionist-002': [
    {
      id: 1,
      receptionistId: 'receptionist-002',
      actorName: 'Trần Văn Bình',
      actorRole: 'RECEPTIONIST',
      action: 'CREATE',
      oldStatus: null,
      newStatus: 'PENDING',
      note: 'Nộp hồ sơ đăng ký lễ tân lần đầu',
      createdAt: '2024-02-20T10:15:00',
    },
    {
      id: 2,
      receptionistId: 'receptionist-002',
      actorName: 'Admin System',
      actorRole: 'ADMIN',
      action: 'VERIFY',
      oldStatus: 'PENDING',
      newStatus: 'VERIFIED',
      note: 'Admin xác thực hồ sơ lễ tân',
      createdAt: '2024-02-25T09:00:00',
    },
  ],
};

export const fetchMockReceptionists = (
  page: number = 0,
  size: number = 10,
  keyword?: string,
  status?: string,
  hospitalId?: string,
  sortBy: string = 'createdAt',
  sortDir: string = 'desc'
): Promise<PageResponse<ReceptionistListResponse>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockReceptionists];

      if (keyword) {
        const lowerKeyword = keyword.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.fullName.toLowerCase().includes(lowerKeyword) ||
            r.email.toLowerCase().includes(lowerKeyword) ||
            r.receptionistCode.toLowerCase().includes(lowerKeyword)
        );
      }

      if (status && status !== 'ALL') {
        filtered = filtered.filter((r) => r.status === status);
      }

      if (hospitalId && hospitalId !== 'ALL') {
        filtered = filtered.filter((r) => r.hospitalName.toLowerCase().includes(hospitalId.toLowerCase()));
      }

      if (sortBy === 'fullName') {
        filtered.sort((a, b) => {
          const comparison = a.fullName.localeCompare(b.fullName);
          return sortDir === 'asc' ? comparison : -comparison;
        });
      } else if (sortBy === 'createdAt') {
        filtered.sort((a, b) => {
          const comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          return sortDir === 'asc' ? comparison : -comparison;
        });
      }

      const start = page * size;
      const end = start + size;
      const content = filtered.slice(start, end);

      resolve({
        content,
        totalPages: Math.ceil(filtered.length / size),
        totalElements: filtered.length,
        size,
        number: page,
        first: page === 0,
        last: end >= filtered.length,
        empty: content.length === 0,
        pageable: {
          pageNumber: page,
          pageSize: size,
          sort: { empty: true, sorted: false, unsorted: true },
          offset: page * size,
          paged: true,
          unpaged: false,
        },
        sort: { empty: true, sorted: false, unsorted: true },
        numberOfElements: content.length,
      });
    }, 500);
  });
};

export const fetchMockReceptionistDetail = (receptionistId: string): Promise<ReceptionistDetailResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const detail = mockReceptionistDetails[receptionistId];
      const history = mockReceptionistHistories[receptionistId] || [];
      if (detail) {
        resolve({ ...detail, history });
      } else {
        reject(new Error('Receptionist not found'));
      }
    }, 500);
  });
};

// ==================== MOCK PENDING RECEPTIONISTS ====================

export const mockPendingReceptionists: ReceptionistListResponse[] = [
  {
    id: 'rec-pending-001',
    receptionistCode: 'REC-2025-001',
    fullName: 'Nguyễn Thị Mai Anh',
    email: 'maianh.nguyen@email.com',
    phone: '0912345001',
    hospitalName: 'Bệnh viện Đa khoa Xuyên Á',
    status: 'PENDING',
    createdAt: '2025-05-25T08:30:00',
  },
  {
    id: 'rec-pending-002',
    receptionistCode: 'REC-2025-002',
    fullName: 'Trần Văn Bảo',
    email: 'bao.tran@email.com',
    phone: '0912345002',
    hospitalName: 'Bệnh viện Quốc tế City',
    status: 'PENDING',
    createdAt: '2025-05-26T10:15:00',
  },
  {
    id: 'rec-pending-003',
    receptionistCode: 'REC-2025-003',
    fullName: 'Lê Thị Cúc',
    email: 'cuc.le@email.com',
    phone: '0912345003',
    hospitalName: 'Phòng khám Đa khoa Medic',
    status: 'PENDING',
    createdAt: '2025-05-27T14:45:00',
  },
  {
    id: 'rec-pending-004',
    receptionistCode: 'REC-2025-004',
    fullName: 'Phạm Văn Đức',
    email: 'duc.pham@email.com',
    phone: '0912345004',
    hospitalName: 'Bệnh viện Đa khoa Xuyên Á',
    status: 'PENDING',
    createdAt: '2025-05-28T09:20:00',
  },
  {
    id: 'rec-pending-005',
    receptionistCode: 'REC-2025-005',
    fullName: 'Hoàng Thị Em',
    email: 'em.hoang@email.com',
    phone: '0912345005',
    hospitalName: 'Bệnh viện Quốc tế City',
    status: 'PENDING',
    createdAt: '2025-05-29T16:00:00',
  },
];

// ==================== MOCK TOP DOCTORS FOR ADMIN ====================

export const mockTopDoctorsForAdmin: TopDoctorResponse[] = [
  {
    doctorId: 'doctor-001',
    doctorName: 'GS.TS. Nguyễn Văn An',
    specialtyName: 'Tim mạch can thiệp',
    totalRevenueCollected: 185000000,
    totalRevenueCompleted: 175000000,
    totalPatientsCompleted: 245,
    totalBookingsPaid: 260,
    averageRating: 4.9,
    rank: 1,
  },
  {
    doctorId: 'doctor-002',
    doctorName: 'PGS.TS. Trần Thị Bình',
    specialtyName: 'Nội thần kinh',
    totalRevenueCollected: 162000000,
    totalRevenueCompleted: 158000000,
    totalPatientsCompleted: 218,
    totalBookingsPaid: 230,
    averageRating: 4.8,
    rank: 2,
  },
  {
    doctorId: 'doctor-003',
    doctorName: 'TS.BS. Lê Văn Cường',
    specialtyName: 'Ngoại tổng quát',
    totalRevenueCollected: 148000000,
    totalRevenueCompleted: 142000000,
    totalPatientsCompleted: 198,
    totalBookingsPaid: 210,
    averageRating: 4.7,
    rank: 3,
  },
  {
    doctorId: 'doctor-004',
    doctorName: 'BS.CKII. Phạm Thị Dung',
    specialtyName: 'Sản phụ khoa',
    totalRevenueCollected: 135000000,
    totalRevenueCompleted: 130000000,
    totalPatientsCompleted: 187,
    totalBookingsPaid: 195,
    averageRating: 4.9,
    rank: 4,
  },
  {
    doctorId: 'doctor-005',
    doctorName: 'BS.CKI. Hoàng Văn Em',
    specialtyName: 'Nhi khoa',
    totalRevenueCollected: 122000000,
    totalRevenueCompleted: 118000000,
    totalPatientsCompleted: 176,
    totalBookingsPaid: 185,
    averageRating: 4.6,
    rank: 5,
  },
  {
    doctorId: 'doctor-006',
    doctorName: 'ThS.BS. Vũ Thị Phượng',
    specialtyName: 'Da liễu - Thẩm mỹ',
    totalRevenueCollected: 110000000,
    totalRevenueCompleted: 105000000,
    totalPatientsCompleted: 158,
    totalBookingsPaid: 168,
    averageRating: 4.8,
    rank: 6,
  },
  {
    doctorId: 'doctor-007',
    doctorName: 'BS. Đặng Văn Hùng',
    specialtyName: 'Tai Mũi Họng',
    totalRevenueCollected: 98000000,
    totalRevenueCompleted: 95000000,
    totalPatientsCompleted: 145,
    totalBookingsPaid: 152,
    averageRating: 4.5,
    rank: 7,
  },
  {
    doctorId: 'doctor-008',
    doctorName: 'BS. Bùi Thị Lan',
    specialtyName: 'Mắt',
    totalRevenueCollected: 89000000,
    totalRevenueCompleted: 86000000,
    totalPatientsCompleted: 132,
    totalBookingsPaid: 140,
    averageRating: 4.7,
    rank: 8,
  },
  {
    doctorId: 'doctor-009',
    doctorName: 'BS. Trịnh Quốc Bảo',
    specialtyName: 'Cơ xương khớp',
    totalRevenueCollected: 82000000,
    totalRevenueCompleted: 79000000,
    totalPatientsCompleted: 125,
    totalBookingsPaid: 130,
    averageRating: 4.4,
    rank: 9,
  },
  {
    doctorId: 'doctor-010',
    doctorName: 'BS. Lý Thị Hồng',
    specialtyName: 'Nội tiết',
    totalRevenueCollected: 75000000,
    totalRevenueCompleted: 72000000,
    totalPatientsCompleted: 118,
    totalBookingsPaid: 125,
    averageRating: 4.6,
    rank: 10,
  },
];

// ==================== MOCK TOP MEDICINES FOR ADMIN ====================

export const mockTopMedicinesForAdmin: TopMedicineResponse[] = [
  { medicineName: 'Paracetamol 500mg', prescriptionCount: 1250 },
  { medicineName: 'Amoxicillin 500mg', prescriptionCount: 980 },
  { medicineName: 'Azithromycin 250mg', prescriptionCount: 850 },
  { medicineName: 'Omeprazole 20mg', prescriptionCount: 720 },
  { medicineName: 'Salbutamol Inhaler', prescriptionCount: 650 },
  { medicineName: 'Cefixime 200mg', prescriptionCount: 580 },
  { medicineName: 'Losartan 50mg', prescriptionCount: 520 },
  { medicineName: 'Metformin 850mg', prescriptionCount: 490 },
  { medicineName: 'Cetirizine 10mg', prescriptionCount: 450 },
  { medicineName: 'Ambroxol 30mg', prescriptionCount: 410 },
];


// ==================== MOCK MONTHLY REVENUE FOR ADMIN ====================

export const mockMonthlyRevenueForAdmin: RevenueData[] = [
  { month: 6, year: 2024, revenue: 125000000 },
  { month: 7, year: 2024, revenue: 142000000 },
  { month: 8, year: 2024, revenue: 138000000 },
  { month: 9, year: 2024, revenue: 156000000 },
  { month: 10, year: 2024, revenue: 168000000 },
  { month: 11, year: 2024, revenue: 175000000 },
  { month: 12, year: 2024, revenue: 198000000 },
  { month: 1, year: 2025, revenue: 185000000 },
  { month: 2, year: 2025, revenue: 165000000 },
  { month: 3, year: 2025, revenue: 210000000 },
  { month: 4, year: 2025, revenue: 225000000 },
  { month: 5, year: 2025, revenue: 245000000 },
];