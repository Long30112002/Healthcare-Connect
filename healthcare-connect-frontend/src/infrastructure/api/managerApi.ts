import type { ManagerDashboardStats, ReceptionistForManager, AppointmentTodayResponse, WeeklyStatResponse} from "../../core/types";
import type { RejectDoctorRequest, RejectReceptionistRequest } from "../../core/types/api.request";
import type { DoctorResponse, PageResponse, RoomResponse, TopDoctorResponse } from "../../core/types/api.response";
import axiosClient from "./axiosClient";
import { fetchManagerDashboardStats as fetchMockDashboardStats, fetchPendingDoctors as fetchMockPendingDoctors, fetchPendingReceptionists as fetchMockPendingReceptionists, fetchTodayAppointments as fetchMockTodayAppointments, fetchWeeklyStats as fetchMockWeeklyStats, fetchTopDoctors as fetchMockTopDoctors, fetchRooms as fetchMockRooms, USE_MOCK_MANAGER } from '../../shared/mock/managerMock';

export const managerApi = {
    getManagerDashboardStats: async (): Promise<ManagerDashboardStats> => {
        if (USE_MOCK_MANAGER) {
            return fetchMockDashboardStats();
        }
        const response = await axiosClient.get('/manager/statistics/dashboard');
        return response.data.data;
    },

    getCurrentHospital: async (): Promise<{ id: string; name: string }> => {
        const response = await axiosClient.get('/manager/current-hospital');
        return response.data.data;
    },

    getDoctorsByManager: async (
        page: number = 0,
        size: number = 10,
        status?: string
    ): Promise<PageResponse<DoctorResponse>> => {
        if (USE_MOCK_MANAGER) {
            const response = await fetchMockPendingDoctors();
            return {
                content: response as any,
                totalPages: 1,
                totalElements: response.length,
                size,
                number: page,
                first: page === 0,
                last: true,
                empty: response.length === 0,
                pageable: {
                    pageNumber: page,
                    pageSize: size,
                    sort: { empty: true, sorted: false, unsorted: true },
                    offset: page * size,
                    paged: true,
                    unpaged: false,
                },
                sort: { empty: true, sorted: false, unsorted: true },
                numberOfElements: response.length,
            };
        }
        const params: any = { page, size };
        if (status) params.status = status;
        const response = await axiosClient.get('/manager/doctors', { params });
        return response.data.data;
    },

    getDoctorById: async (doctorId: string): Promise<DoctorResponse> => {
        const response = await axiosClient.get(`/manager/doctors/${doctorId}`);
        return response.data.data;
    },

    getPendingDoctors: async (): Promise<DoctorResponse[]> => {
        if (USE_MOCK_MANAGER) {
            return fetchMockPendingDoctors() as Promise<any>;
        }
        // const response = await axiosClient.get('/manager/doctors/pending');
        const response = await axiosClient.get('/manager/doctors', { params: { status: 'VERIFIED', page: 0, size: 100 } });
        return response.data.data.content;
    },

    approveDoctor: async (doctorId: string): Promise<void> => {
        if (USE_MOCK_MANAGER) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return;
        }
        await axiosClient.patch(`/manager/doctors/${doctorId}/approve`);
    },

    rejectDoctor: async (doctorId: string, data: RejectDoctorRequest): Promise<void> => {
        if (USE_MOCK_MANAGER) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return;
        }
        await axiosClient.post(`/manager/doctors/${doctorId}/reject`, data);
    },

    getPendingReceptionists: async (): Promise<ReceptionistForManager[]> => {
        if (USE_MOCK_MANAGER) {
            return fetchMockPendingReceptionists();
        }
        // const response = await axiosClient.get('/manager/receptionists/pending');
        const response = await axiosClient.get('/manager/receptionists', { params: { status: 'VERIFIED', page: 0, size: 100 } });
        return response.data.data.content;
    },

    approveReceptionist: async (receptionistId: string): Promise<void> => {
        if (USE_MOCK_MANAGER) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return;
        }
        await axiosClient.patch(`/manager/receptionists/${receptionistId}/approve`);
    },

    rejectReceptionist: async (receptionistId: string, data: RejectReceptionistRequest): Promise<void> => {
        if (USE_MOCK_MANAGER) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return;
        }
        await axiosClient.post(`/manager/receptionists/${receptionistId}/reject`, data);
    },

    getTodayAppointments: async (): Promise<AppointmentTodayResponse[]> => {
        if (USE_MOCK_MANAGER) {
            return fetchMockTodayAppointments();
        }
        const response = await axiosClient.get('/manager/appointments/today');
        return response.data.data;
    },

    getWeeklyStatistics: async (): Promise<WeeklyStatResponse[]> => {
        if (USE_MOCK_MANAGER) {
            return fetchMockWeeklyStats();
        }
        // const response = await axiosClient.get('/manager/statistics/weekly');
        const response = await axiosClient.get('/manager/statistics/weekly');
        return response.data.data;
    },

    getTopDoctors: async (limit: number = 5): Promise<TopDoctorResponse[]> => {
        if (USE_MOCK_MANAGER) {
            const data = await fetchMockTopDoctors();
            return data.slice(0, limit);
        }
        const response = await axiosClient.get(`/manager/statistics/top-doctors?limit=${limit}`);
        return response.data.data;
    },

    getRooms: async (): Promise<RoomResponse[]> => {
        if (USE_MOCK_MANAGER) {
            return fetchMockRooms();
        }
        const response = await axiosClient.get('/manager/rooms');
        return response.data.data;
    },

    createRoom: async (data: { roomNumber: string; floor?: number; building?: string }): Promise<RoomResponse> => {
        if (USE_MOCK_MANAGER) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                id: 'new-room-id',
                roomNumber: data.roomNumber,
                floor: data.floor ?? 0,
                building: data.building ?? '',
                status: 'AVAILABLE',
            };
        }
        const response = await axiosClient.post('/manager/rooms', data);
        return response.data.data;
    },

    updateRoom: async (roomId: string, data: { roomNumber: string; floor?: number; building?: string }): Promise<RoomResponse> => {
        if (USE_MOCK_MANAGER) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                id: roomId,
                roomNumber: data.roomNumber,
                floor: data.floor ?? 0,
                building: data.building ?? '',
                status: 'AVAILABLE',
            };
        }
        const response = await axiosClient.put(`/manager/rooms/${roomId}`, data);
        return response.data.data;
    },

    deleteRoom: async (roomId: string): Promise<void> => {
        if (USE_MOCK_MANAGER) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return;
        }
        await axiosClient.delete(`/manager/rooms/${roomId}`);
    },

    setRoomMaintenance: async (roomId: string): Promise<void> => {
        if (USE_MOCK_MANAGER) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return;
        }
        await axiosClient.patch(`/manager/rooms/${roomId}/maintenance`);
    },

    activateRoom: async (roomId: string): Promise<void> => {
        if (USE_MOCK_MANAGER) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return;
        }
        await axiosClient.patch(`/manager/rooms/${roomId}/activate`);
    },

    getReceptionistsByManager: async (
        page: number = 0,
        size: number = 10,
        status?: string
    ): Promise<PageResponse<ReceptionistForManager>> => {
        if (USE_MOCK_MANAGER) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const data = await fetchMockPendingReceptionists();
            let filtered = data;
            if (status && status !== 'ALL') {
                filtered = data.filter(r => r.status === status);
            }
            return {
                content: filtered,
                totalPages: Math.ceil(filtered.length / size),
                totalElements: filtered.length,
                size,
                number: page,
                first: page === 0,
                last: true,
                empty: filtered.length === 0,
                pageable: {
                    pageNumber: page,
                    pageSize: size,
                    sort: { empty: true, sorted: false, unsorted: true },
                    offset: page * size,
                    paged: true,
                    unpaged: false,
                },
                sort: { empty: true, sorted: false, unsorted: true },
                numberOfElements: filtered.length,
            };
        }
        const params: any = { page, size };
        if (status) params.status = status;
        const response = await axiosClient.get('/manager/receptionists', { params });
        return response.data.data;
    }
};