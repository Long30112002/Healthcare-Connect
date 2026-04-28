import type { Appointment } from '../../core/types';
import type { AppointmentResponse, PatientResponse, WalkInAppointmentItem } from '../../core/types/api.response';
import axiosClient from './axiosClient';

export const appointmentApi = {
    bookAppointment: async (scheduleId: string, symptoms: string): Promise<AppointmentResponse> => {
        const response = await axiosClient.post('/appointments/book', { scheduleId, symptoms });
        return response.data.data;
    },

    cancelAppointment: async (appointmentId: string, reason?: string): Promise<void> => {
        await axiosClient.post(`/appointments/${appointmentId}/cancel`, { reason: reason || '' });
    },

    getPatientById: async (patientId: string): Promise<any> => {
        const response = await axiosClient.get(`/patients/${patientId}`);
        return response.data.data;
    },

    getPatientAppointments: async (patientId: string): Promise<Appointment[]> => {
        const response = await axiosClient.get(`/doctor/patients/${patientId}/appointments`);
        return response.data.data;
    },

    getWalkInAppointments: async (phone: string): Promise<WalkInAppointmentItem[]> => {
        const response = await axiosClient.get(`/doctor/walk-in-appointments`, { params: { phone } });
        return response.data.data;
    },

    // getDoctorAppointments: async (page: number = 0, size: number = 10, status?: string): Promise<PageResponse<Appointment>> => {
    //     const params: any = { page, size };
    //     if (status) params.status = status;
    //     const response = await axiosClient.get('/doctor/appointments', { params });
    //     return response.data.data;
    // },

    getAppointmentById: async (id: string): Promise<Appointment> => {
        const response = await axiosClient.get(`/appointments/${id}`);
        return response.data.data;
    },

    hasMedicalRecord: async (appointmentId: string): Promise<boolean> => {
        try {
            await axiosClient.get(`/medical-records/appointment/${appointmentId}`);
            return true;
        } catch {
            return false;
        }
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
    },

    getAppointmentDetail: async (appointmentId: string): Promise<Appointment> => {
        const response = await axiosClient.get(`/appointments/${appointmentId}`);
        return response.data.data;
    },

    getMyPatients: async (): Promise<PatientResponse[]> => {
        const response = await axiosClient.get('/doctor/my-patients');
        return response.data.data;
    }
};