import type { Appointment } from '../../core/types';
import type { AppointmentResponse, PageResponse } from '../../core/types/api.response';
import axiosClient from './axiosClient';

export const appointmentApi = {
    bookAppointment: async (scheduleId: string, symptoms: string): Promise<AppointmentResponse> => {
        const response = await axiosClient.post('/appointments/book', { scheduleId, symptoms });
        return response.data.data;
    },

    cancelAppointment: async (appointmentId: string, reason?: string): Promise<void> => {
        await axiosClient.post(`/appointments/${appointmentId}/cancel`, { reason: reason || '' });
    },

    getDoctorAppointments: async (page: number = 0, size: number = 10, status?: string): Promise<PageResponse<Appointment>> => {
        const params: any = { page, size };
        if (status) params.status = status;
        const response = await axiosClient.get('/doctor/appointments', { params });
        return response.data.data;
    },

    checkIn: async (appointmentId: string): Promise<void> => {
        await axiosClient.patch(`doctor/${appointmentId}/check-in`);
    },

    completeExam: async (appointmentId: string): Promise<void> => {
        await axiosClient.patch(`doctor/${appointmentId}/complete`);
    },
    
    checkInByToken: async (token: string): Promise<any> => {
        const response = await axiosClient.post(`/check-in?token=${token}`);
        return response.data.data;
    }
};