export const USE_MOCK_DOCTOR_STATS = false; 

// FE mong đợi cấu trúc này
interface DoctorStatisticsData {
  summary: {
    totalPatients: number;        // Tổng BN (cả online + walk-in)
    totalPatientsChange: number;  // % thay đổi
    revenue: number;              // Doanh thu (chỉ tính paid = true)
    revenueChange: number;
    averageRating: number;        // Đánh giá trung bình
    averageRatingChange: number;
    totalPrescriptions: number;   // Tổng đơn thuốc
    totalPrescriptionsChange: number;
  };
  monthlyTrend: Array<{ month: number; year: number; count: number }>;
  topDiagnoses: Array<{ diagnosis: string; count: number }>;
  topMedicines: Array<{ medicineName: string; count: number }>;
  ratingDistribution: Array<{ stars: number; count: number; percentage: number }>;
  doctorRanking: Array<{ doctorId: string; name: string; totalPatients: number; revenue: number; rating: number; rank: number }>;
}

// Bác sĩ A (đang login) - thuộc Bệnh viện X
const doctorAData: DoctorStatisticsData = {
  summary: {
    totalPatients: 156,
    totalPatientsChange: 12,      // Tăng 12% so với tháng trước
    revenue: 12450000,
    revenueChange: 8,
    averageRating: 4.8,
    averageRatingChange: 0.2,
    totalPrescriptions: 89,
    totalPrescriptionsChange: 15,
  },
  monthlyTrend: [
    { month: 1, year: 2024, count: 45 },
    { month: 2, year: 2024, count: 52 },
    { month: 3, year: 2024, count: 48 },
    { month: 4, year: 2024, count: 67 },
    { month: 5, year: 2024, count: 73 },
    { month: 6, year: 2024, count: 89 },
    { month: 7, year: 2024, count: 94 },
    { month: 8, year: 2024, count: 112 },
    { month: 9, year: 2024, count: 128 },
    { month: 10, year: 2024, count: 135 },
    { month: 11, year: 2024, count: 148 },
    { month: 12, year: 2024, count: 156 },
  ],
  topDiagnoses: [
    { diagnosis: 'Cảm cúm', count: 45 },
    { diagnosis: 'Tăng huyết áp', count: 32 },
    { diagnosis: 'Viêm họng', count: 28 },
    { diagnosis: 'Đau dạ dày', count: 21 },
    { diagnosis: 'Viêm phế quản', count: 15 },
  ],
  topMedicines: [
    { medicineName: 'Paracetamol', count: 78 },
    { medicineName: 'Amoxicillin', count: 45 },
    { medicineName: 'Azithromycin', count: 32 },
    { medicineName: 'Omeprazole', count: 28 },
    { medicineName: 'Salbutamol', count: 15 },
  ],
  ratingDistribution: [
    { stars: 5, count: 62, percentage: 78 },
    { stars: 4, count: 12, percentage: 15 },
    { stars: 3, count: 4, percentage: 5 },
    { stars: 2, count: 2, percentage: 2 },
    { stars: 1, count: 2, percentage: 2 },
  ],
  doctorRanking: [
    { doctorId: 'doctor-1', name: 'Nguyễn Văn A (Tôi)', totalPatients: 156, revenue: 12450000, rating: 4.8, rank: 1 },
    { doctorId: 'doctor-2', name: 'Trần Văn B', totalPatients: 142, revenue: 11200000, rating: 4.7, rank: 2 },
    { doctorId: 'doctor-3', name: 'Lê Thị C', totalPatients: 128, revenue: 10500000, rating: 4.9, rank: 3 },
    { doctorId: 'doctor-4', name: 'Phạm Văn D', totalPatients: 98, revenue: 8200000, rating: 4.5, rank: 4 },
    { doctorId: 'doctor-5', name: 'Hoàng Thị E', totalPatients: 87, revenue: 7100000, rating: 4.6, rank: 5 },
  ],
};

// Bác sĩ B - thuộc Bệnh viện Y (dữ liệu khác)
const doctorBData: DoctorStatisticsData = {
  summary: {
    totalPatients: 89,
    totalPatientsChange: -5,      // Giảm 5%
    revenue: 8900000,
    revenueChange: -2,
    averageRating: 4.5,
    averageRatingChange: -0.1,
    totalPrescriptions: 67,
    totalPrescriptionsChange: 8,
  },
  monthlyTrend: [
    { month: 1, year: 2024, count: 30 },
    { month: 2, year: 2024, count: 32 },
    { month: 3, year: 2024, count: 28 },
    { month: 4, year: 2024, count: 35 },
    { month: 5, year: 2024, count: 42 },
    { month: 6, year: 2024, count: 48 },
    { month: 7, year: 2024, count: 52 },
    { month: 8, year: 2024, count: 58 },
    { month: 9, year: 2024, count: 65 },
    { month: 10, year: 2024, count: 72 },
    { month: 11, year: 2024, count: 78 },
    { month: 12, year: 2024, count: 89 },
  ],
  topDiagnoses: [
    { diagnosis: 'Viêm họng', count: 28 },
    { diagnosis: 'Cảm cúm', count: 25 },
    { diagnosis: 'Viêm amidan', count: 18 },
    { diagnosis: 'Đau đầu', count: 15 },
    { diagnosis: 'Sốt virus', count: 12 },
  ],
  topMedicines: [
    { medicineName: 'Amoxicillin', count: 45 },
    { medicineName: 'Paracetamol', count: 38 },
    { medicineName: 'Cefixime', count: 25 },
    { medicineName: 'Ibuprofen', count: 18 },
    { medicineName: 'Azithromycin', count: 12 },
  ],
  ratingDistribution: [
    { stars: 5, count: 35, percentage: 55 },
    { stars: 4, count: 18, percentage: 28 },
    { stars: 3, count: 8, percentage: 12 },
    { stars: 2, count: 2, percentage: 3 },
    { stars: 1, count: 1, percentage: 2 },
  ],
  doctorRanking: [
    { doctorId: 'doctor-1', name: 'Nguyễn Văn A', totalPatients: 156, revenue: 12450000, rating: 4.8, rank: 1 },
    { doctorId: 'doctor-2', name: 'Trần Văn B (Tôi)', totalPatients: 142, revenue: 11200000, rating: 4.7, rank: 2 },
    { doctorId: 'doctor-3', name: 'Lê Thị C', totalPatients: 128, revenue: 10500000, rating: 4.9, rank: 3 },
  ],
};

const mockDataByDoctorId: Record<string, DoctorStatisticsData> = {
  'doctor-1': doctorAData,  // Bác sĩ Nguyễn Văn A (đang login)
  'doctor-2': doctorBData,  // Bác sĩ Trần Văn B
};

export const fetchDoctorStatistics = async (
  _period: string,
  doctorId: string
): Promise<DoctorStatisticsData> => {
  if (USE_MOCK_DOCTOR_STATS) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Trả về dữ liệu theo đúng doctorId
    const data = mockDataByDoctorId[doctorId];
    if (!data) {
      console.warn(`No mock data for doctorId: ${doctorId}, using default`);
      return doctorAData; // Fallback
    }
    return data;
  }
  
  throw new Error('API not implemented yet');
};

export const getCurrentDoctorInfo = async (): Promise<{
  id: string;
  name: string;
  hospitalName: string;
  specialtyName?: string;
}> => {
  if (USE_MOCK_DOCTOR_STATS) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      id: 'doctor-1',
      name: 'Nguyễn Văn A',
      hospitalName: 'Bệnh viện Đại học Y Dược',
      specialtyName: 'Nội tổng hợp',
    };
  }
  
  // TODO: Gọi API thật
  // const response = await axiosClient.get('/api/doctor/my-info');
  // return response.data.data;
  
  throw new Error('API not implemented yet');
};