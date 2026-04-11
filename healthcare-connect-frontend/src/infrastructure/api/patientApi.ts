import type { DoctorDetail, DoctorListItem } from '../../core/types';
import axiosClient from './axiosClient';

export const patientApi = {
    getAvailableDoctors: (): Promise<DoctorListItem[]> => {
        return axiosClient.get('/patients/doctors/available');
    },

    getDoctorDetail: (doctorId: string): Promise<DoctorDetail> => {
        return axiosClient.get(`/patients/doctors/${doctorId}`);
    },

    getAvailableDoctorsByDate: async (date: string): Promise<DoctorListItem[]> => {
        const response = await axiosClient.get(`/patients/doctors/available?date=${date}`);
        return response.data.data || [];
    },

    getAvailableDoctorsByDays: async (days: number): Promise<DoctorListItem[]> => {
        const response = await axiosClient.get(`/patients/doctors/available?days=${days}`);
        return response.data.data || [];
    },

};