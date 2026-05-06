import {
  fetchDoctorStatistics as fetchMockDoctorStatistics,
  getCurrentDoctorInfo as getMockCurrentDoctorInfo,
  USE_MOCK_DOCTOR_STATS
} from '../../shared/mock/doctorStatisticsMock';
import axiosClient from './axiosClient';

// ==================== DOCTOR STATISTICS ====================

export interface DoctorStatisticsData {
  summary: {
    totalPatients: number;
    totalPatientsChange: number;
    revenue: number;
    revenueChange: number;
    averageRating: number;
    averageRatingChange: number;
    totalPrescriptions: number;
    totalPrescriptionsChange: number;
  };
  monthlyTrend: Array<{ month: number; year: number; count: number }>;
  topDiagnoses: Array<{ diagnosis: string; count: number }>;
  topMedicines: Array<{ medicineName: string; count: number }>;
  ratingDistribution: Array<{ stars: number; count: number; percentage: number }>;
  doctorRanking: Array<{ doctorId: string; name: string; totalPatients: number; revenue: number; rating: number; rank: number }>;
}

export interface CurrentDoctorInfo {
  id: string;
  name: string;
  hospitalName: string;
  specialtyName?: string;
}

/**
 * Lấy thống kê của bác sĩ hiện tại
 */
export const getDoctorStatistics = async (period: string): Promise<DoctorStatisticsData> => {
  if (USE_MOCK_DOCTOR_STATS) {
    const doctorInfo = await getMockCurrentDoctorInfo();
    return await fetchMockDoctorStatistics(period, doctorInfo.id);
  }
  
  const response = await axiosClient.get(`/doctor/statistics`, {
    params: { period }
  });
  return response.data.data;
};

/**
 * Lấy thông tin bác sĩ hiện tại
 */
export const getCurrentDoctorInfo = async (): Promise<CurrentDoctorInfo> => {
  if (USE_MOCK_DOCTOR_STATS) {
    return await getMockCurrentDoctorInfo();
  }
  
  // Cách 1: Dùng API /users/my-info (đã có sẵn trong dự án)
  const response = await axiosClient.get(`/users/my-info`);
  const user = response.data.data;
  
  // Cách 2: Nếu cần thêm thông tin bệnh viện, gọi thêm API
  // const doctorResponse = await axiosClient.get(`/doctor/my-info`);
  
  return {
    id: user.id,
    name: user.fullName,
    hospitalName: user.hospitalName || 'Bệnh viện',
    specialtyName: user.specialtyName,
  };
};

/**
 * Xuất báo cáo - HIỆN TẠI DÙNG CLIENT-SIDE (exportUtils)
 * Hàm này không cần dùng, giữ lại để sau nếu backend support
 */
export const exportDoctorStatisticsReport = async (period: string, format: 'excel' | 'pdf'): Promise<Blob> => {
  // FE đang tự xuất bằng exportUtils, không cần gọi API này
  throw new Error('Use client-side export instead (exportUtils.ts)');
};