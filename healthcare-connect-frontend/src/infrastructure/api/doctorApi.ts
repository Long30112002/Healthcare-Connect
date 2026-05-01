import axiosClient from './axiosClient';
import type { Schedule, VisitedDoctor } from '../../core/types';
import type { DoctorResponse, PageResponse } from '../../core/types/api.response';
import type { UpdateDoctorInfoRequest } from '../../core/types/api.request';


export const doctorApi = {
    getVisitedDoctors: async (): Promise<VisitedDoctor[]> => {
        const response = await axiosClient.get('/doctors/visited');
        return response.data.data;
    },
    applyDoctor: async (formData: FormData): Promise<void> => {
        const response = await axiosClient.post('/doctors/apply', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    updateMyInfo: async (data: UpdateDoctorInfoRequest): Promise<DoctorResponse> => {
        const response = await axiosClient.put('/doctor/my-info', data);
        return response.data.data;
    },

    createSchedule: async (data: { date: string; startTime: string; endTime: string; price: number; maxPatients: number; roomId?: string; }): Promise<any> => {
        const response = await axiosClient.post('/doctor/schedules', data);
        return response.data.data;
    },

    getSchedules: async (page: number = 0, size: number = 10): Promise<PageResponse<Schedule>> => {
        const response = await axiosClient.get(`/doctor/schedules?page=${page}&size=${size}`);
        return response.data.data;
    },

    deleteSchedule: async (scheduleId: string): Promise<void> => {
        await axiosClient.delete(`/doctor/schedules/${scheduleId}`);
    },

    getScheduleDetail: async (scheduleId: string): Promise<any> => {
        const response = await axiosClient.get(`/doctor/schedules/${scheduleId}`);
        return response.data.data;
    },

    updateSchedule: async (scheduleId: string, data: any): Promise<any> => {
        const response = await axiosClient.put(`/doctor/schedules/${scheduleId}`, data);
        return response.data.data;
    },

    getMyInfo: async (): Promise<DoctorResponse> => {
        const response = await axiosClient.get('/doctor/my-info');
        return response.data.data;
    }
};