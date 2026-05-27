import axiosClient from './axiosClient';
import type { DoctorResponse } from '../../core/types/api.response';
import type { RejectDoctorRequest } from '../../core/types/api.request';
import {
  USE_MOCK_ADMIN,
  fetchMockDashboardStats,
  fetchMockTopHospitals,
  fetchMockUserTrend,
  fetchMockPendingDoctors,
} from '../../shared/mock/adminMock';
import type { DashboardStats, TopHospital, UserTrend } from '../../core/types';

export interface PendingDoctor extends DoctorResponse {
  hospitalName: string;
  hospitalAddress: string;
  createdAt: string;
}

export const adminApi = {
  // Dashboard APIs
  getDashboardStats: async (): Promise<DashboardStats> => {
    if (USE_MOCK_ADMIN) {
      return fetchMockDashboardStats();
    }
    const response = await axiosClient.get('/admin/statistics');
    return response.data.data;
  },

  getPendingDoctors: async (): Promise<PendingDoctor[]> => {
    if (USE_MOCK_ADMIN) {
      return fetchMockPendingDoctors();
    }
    const response = await axiosClient.get('/admin/doctors/pending');
    return response.data.data;
  },

  getTopHospitals: async (limit: number = 5): Promise<TopHospital[]> => {
    if (USE_MOCK_ADMIN) {
      return fetchMockTopHospitals(limit);
    }
    const response = await axiosClient.get(`/admin/hospitals/top?limit=${limit}`);
    return response.data.data;
  },

  getUserTrend: async (): Promise<UserTrend[]> => {
    if (USE_MOCK_ADMIN) {
      return fetchMockUserTrend();
    }
    const response = await axiosClient.get('/admin/statistics/user-trend');
    return response.data.data;
  },

  // Doctor Management
  approveDoctor: async (doctorId: string): Promise<void> => {
    if (USE_MOCK_ADMIN) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }
    await axiosClient.patch(`/admin/doctors/${doctorId}/approve`);
  },

  rejectDoctor: async (doctorId: string, data: RejectDoctorRequest): Promise<void> => {
    if (USE_MOCK_ADMIN) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }
    await axiosClient.post(`/admin/doctors/${doctorId}/reject`, data);
  },
};