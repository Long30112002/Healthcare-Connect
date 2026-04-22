import axiosClient from './axiosClient';
import type { VisitedDoctor } from '../../core/types';


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
};