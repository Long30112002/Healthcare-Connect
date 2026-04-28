import type { CreateMedicalRecordRequest } from '../../core/types/api.request';
import type { MedicalRecordResponse } from '../../core/types/api.response';
import axiosClient from './axiosClient';

export const medicalRecordApi = {
    create: async (data: CreateMedicalRecordRequest): Promise<MedicalRecordResponse> => {
        const response = await axiosClient.post('/medical-records', data);
        return response.data.data;
    },

    getByAppointmentId: async (appointmentId: string): Promise<MedicalRecordResponse> => {
        const response = await axiosClient.get(`/medical-records/appointment/${appointmentId}`);
        return response.data.data;
    },

    getById: async (id: string): Promise<MedicalRecordResponse> => {
        const response = await axiosClient.get(`/medical-records/${id}`);
        return response.data.data;
    },

    getMyRecords: async (): Promise<MedicalRecordResponse[]> => {
        const response = await axiosClient.get('/medical-records/my-records');
        return response.data.data;
    },

    getByPatientId: async (patientId: string): Promise<MedicalRecordResponse[]> => {
        const response = await axiosClient.get(`/medical-records/patient/${patientId}`);
        return response.data.data;
    },

    update: async (id: string, data: CreateMedicalRecordRequest): Promise<MedicalRecordResponse> => {
        const response = await axiosClient.put(`/medical-records/${id}`, data);
        return response.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await axiosClient.delete(`/medical-records/${id}`);
    }
};