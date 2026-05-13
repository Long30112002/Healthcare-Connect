import axiosClient from './axiosClient';
import { fetchDoctorStatistics as fetchMockDoctorStatistics, getCurrentDoctorInfo as getMockCurrentDoctorInfo, USE_MOCK_DOCTOR_STATS } from '../../shared/mock/doctorStatisticsMock';

export const USE_MOCK_STATISTICS = false;

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

export interface RevenueData {
  month: number;
  year: number;
  revenue: number;
}

export interface DepartmentStat {
  departmentName: string;
  totalPatients: number;
  totalRevenue: number;
}

export interface TopMedicine {
  medicineName: string;
  prescriptionCount: number;
}

// ==================== STATISTICS API ====================

export const statisticsApi = {
  // ==================== DOCTOR STATISTICS ====================

  getDoctorStatistics: async (period: string): Promise<DoctorStatisticsData> => {
    if (USE_MOCK_DOCTOR_STATS) {
      const doctorInfo = await getMockCurrentDoctorInfo();
      return await fetchMockDoctorStatistics(period, doctorInfo.id);
    }
    const response = await axiosClient.get(`/doctor/statistics`, {
      params: { period }
    });
    return response.data.data;
  },

  getCurrentDoctorInfo: async (): Promise<CurrentDoctorInfo> => {
    if (USE_MOCK_DOCTOR_STATS) {
      return await getMockCurrentDoctorInfo();
    }
    const response = await axiosClient.get(`/users/my-info`);
    const user = response.data.data;
    return {
      id: user.id,
      name: user.fullName,
      hospitalName: user.hospitalName || 'Bệnh viện',
      specialtyName: user.specialtyName,
    };
  },

  exportDoctorStatisticsReport: async (period: string, format: 'excel' | 'pdf'): Promise<Blob> => {
    // FE đang tự xuất bằng exportUtils, không cần gọi API này
    throw new Error('Use client-side export instead (exportUtils.ts)');
  },

  // ==================== MANAGER STATISTICS ====================

  getRevenueByMonth: async (year?: number): Promise<RevenueData[]> => {
    const params = year ? { year } : {};
    const response = await axiosClient.get('/manager/statistics/revenue', 
      { 
        params 
      });
    return response.data.data;
  },

  getDepartmentStatistics: async (): Promise<DepartmentStat[]> => {
    if (USE_MOCK_STATISTICS) {
      return [
        { departmentName: 'Khoa Nội khoa', totalPatients: 245, totalRevenue: 122500000 },
        { departmentName: 'Khoa Ngoại khoa', totalPatients: 198, totalRevenue: 99000000 },
        { departmentName: 'Khoa Nhi khoa', totalPatients: 175, totalRevenue: 87500000 },
        { departmentName: 'Khoa Tim mạch', totalPatients: 156, totalRevenue: 78000000 },
      ];
    }
    const response = await axiosClient.get('/manager/statistics/departments');
    return response.data.data;
  },

  getTopMedicines: async (limit: number = 5): Promise<TopMedicine[]> => {
    if (USE_MOCK_STATISTICS) {
      return [
        { medicineName: 'Paracetamol', prescriptionCount: 156 },
        { medicineName: 'Amoxicillin', prescriptionCount: 142 },
        { medicineName: 'Azithromycin', prescriptionCount: 128 },
        { medicineName: 'Omeprazole', prescriptionCount: 98 },
        { medicineName: 'Salbutamol', prescriptionCount: 87 },
      ];
    }
    const response = await axiosClient.get(`/manager/statistics/top-medicines?limit=${limit}`);
    return response.data.data;
  },

  exportExcel: async (): Promise<void> => {
    if (USE_MOCK_STATISTICS) {
      console.log('Mock export Excel');
      return;
    }
    const response = await axiosClient.get('/manager/statistics/export/excel', {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `thong_ke_benh_vien_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  exportPDF: async (): Promise<void> => {
    if (USE_MOCK_STATISTICS) {
      console.log('Mock export PDF');
      return;
    }
    const response = await axiosClient.get('/manager/statistics/export/pdf', {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `thong_ke_benh_vien_${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};