import type { AppointmentResponse } from '../../core/types/api.response';
import axiosClient from './axiosClient';

export const appointmentApi = {
    bookAppointment: async (scheduleId: string, symptoms: string): Promise<AppointmentResponse> => {
        const response = await axiosClient.post('/appointments/book', { scheduleId, symptoms });
        return response.data.data;
    },

    cancelAppointment: async (appointmentId: string, reason?: string): Promise<void> => {
        await axiosClient.post(`/appointments/${appointmentId}/cancel`, { reason: reason || '' });
    },
};