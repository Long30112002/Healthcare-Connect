import axiosClient from './axiosClient';
import type { AdminDoctorListResponse, AdminHospitalDetailResponse, AdminHospitalListResponse, AdminUserDetailResponse, AdminUserListResponse, DoctorDetailResponse, DoctorHistoryResponse, DoctorResponse, PageResponse } from '../../core/types/api.response';
import { USE_MOCK_ADMIN, fetchMockDashboardStats, fetchMockTopHospitals, fetchMockUserTrend, fetchMockPendingDoctors, fetchMockUserDetail, fetchMockUsers, fetchMockDoctorDetail, fetchMockDoctorHistory, fetchMockDoctors, fetchMockHospitals, fetchMockHospitalDetail, } from '../../shared/mock/adminMock';
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

  rejectDoctor: async (doctorId: string, reasonCode: string, note?: string): Promise<void> => {
    if (USE_MOCK_ADMIN) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }
    await axiosClient.post(`/admin/doctors/${doctorId}/reject`, { reasonCode, note });
  },

  getUsers: async (
    page: number = 0,
    size: number = 10,
    keyword?: string,
    role?: string,
    enabled?: boolean,
    sortBy?: string,
    sortDir?: string
  ): Promise<PageResponse<AdminUserListResponse>> => {
    if (USE_MOCK_ADMIN) {
      return fetchMockUsers(page, size, keyword, role, enabled, sortBy, sortDir);
    }
    const params: any = { page, size };
    if (keyword) params.keyword = keyword;
    if (role && role !== 'ALL') params.role = role;
    if (enabled !== undefined) params.enabled = enabled;
    if (sortBy) params.sortBy = sortBy;
    if (sortDir) params.sortDir = sortDir;
    const response = await axiosClient.get('/admin/users', { params });
    return response.data.data;
  },

  getUserDetail: async (userId: string): Promise<AdminUserDetailResponse> => {
    if (USE_MOCK_ADMIN) {
      return fetchMockUserDetail(userId);
    }
    const response = await axiosClient.get(`/admin/users/${userId}`);
    return response.data.data;
  },

  toggleUserStatus: async (userId: string, reason?: string): Promise<boolean> => {
    if (USE_MOCK_ADMIN) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return true;
    }
    const response = await axiosClient.patch(`/admin/users/${userId}/toggle-status`, { reason });
    return response.data.data;
  },

  resetUserPassword: async (userId: string): Promise<void> => {
    if (USE_MOCK_ADMIN) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }
    await axiosClient.post(`/admin/users/${userId}/reset-password`);
  },

  exportUsers: async (
    keyword?: string,
    role?: string,
    enabled?: boolean
  ): Promise<Blob> => {
    const params: any = {};
    if (keyword) params.keyword = keyword;
    if (role && role !== 'ALL') params.role = role;
    if (enabled !== undefined) params.enabled = enabled;

    const response = await axiosClient.get('/admin/users/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  getDoctors: async (
    page: number = 0,
    size: number = 10,
    keyword?: string,
    status?: string,
    hospitalId?: string,
    sortBy: string = 'createdAt',
    sortDir: string = 'desc'
  ): Promise<PageResponse<AdminDoctorListResponse>> => {
    if (USE_MOCK_ADMIN) {
      return fetchMockDoctors(page, size, keyword, status, hospitalId, sortBy, sortDir);
    }
    const params: any = { page, size, sortBy, sortDir };
    if (keyword) params.keyword = keyword;
    if (status && status !== 'ALL') params.status = status;
    if (hospitalId && hospitalId !== 'ALL') params.hospitalId = hospitalId;
    const response = await axiosClient.get('/admin/doctors', { params });
    return response.data.data;
  },

  getDoctorDetail: async (doctorId: string): Promise<DoctorDetailResponse> => {
    if (USE_MOCK_ADMIN) {
      return fetchMockDoctorDetail(doctorId);
    }
    const response = await axiosClient.get(`/admin/doctors/${doctorId}`);
    return response.data.data;
  },

  getDoctorHistory: async (doctorId: string): Promise<DoctorHistoryResponse[]> => {
    if (USE_MOCK_ADMIN) {
      return fetchMockDoctorHistory(doctorId);
    }
    const response = await axiosClient.get(`/admin/doctors/${doctorId}/history`);
    return response.data.data;
  },

  exportDoctors: async (keyword?: string, status?: string, hospitalId?: string): Promise<Blob> => {
    const params: any = {};
    if (keyword) params.keyword = keyword;
    if (status && status !== 'ALL') params.status = status;
    if (hospitalId && hospitalId !== 'ALL') params.hospitalId = hospitalId;

    const response = await axiosClient.get('/admin/doctors/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  getHospitals: async (
    page: number = 0,
    size: number = 10,
    keyword?: string,
    sortBy: string = 'createdAt',
    sortDir: string = 'desc'
  ): Promise<PageResponse<AdminHospitalListResponse>> => {
    if (USE_MOCK_ADMIN) {
      return fetchMockHospitals(page, size, keyword, sortBy, sortDir);
    }
    const params: any = { page, size, sortBy, sortDir };
    if (keyword) params.keyword = keyword;
    const response = await axiosClient.get('/admin/hospitals', { params });
    return response.data.data;
  },

  getHospitalDetail: async (hospitalId: string): Promise<AdminHospitalDetailResponse> => {
    if (USE_MOCK_ADMIN) {
      return fetchMockHospitalDetail(hospitalId);
    }
    const response = await axiosClient.get(`/admin/hospitals/${hospitalId}`);
    return response.data.data;
  },

  createHospital: async (data: {
    name: string;
    address: string;
    hotline?: string;
    email?: string;
    website?: string;
    description?: string;
    imageUrl?: string;
    managerEmail: string;
  }): Promise<AdminHospitalDetailResponse> => {
    if (USE_MOCK_ADMIN) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        id: Math.random().toString(36).substring(7),
        name: data.name,
        address: data.address,
        hotline: data.hotline || '',
        email: data.email || '',
        website: data.website || '',
        description: data.description || '',
        imageUrl: data.imageUrl || '',
        managerEmail: data.managerEmail,
        managerName: '',
        managerId: '',
        status: 'PENDING_CONFIRMATION',  // ← THÊM DÒNG NÀY
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        doctorCount: 0,
      };
    }
    const response = await axiosClient.post('/admin/hospitals', data);
    return response.data.data;
  },

  deleteHospital: async (hospitalId: string): Promise<void> => {
    if (USE_MOCK_ADMIN) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }
    await axiosClient.delete(`/admin/hospitals/${hospitalId}`);
  },

  exportHospitals: async (keyword?: string): Promise<Blob> => {
    const params: any = {};
    if (keyword) params.keyword = keyword;

    const response = await axiosClient.get('/admin/hospitals/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  resendInvitation: async (hospitalId: string): Promise<void> => {
    if (USE_MOCK_ADMIN) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }
    await axiosClient.post(`/admin/hospitals/${hospitalId}/resend-invitation`);
  },
};