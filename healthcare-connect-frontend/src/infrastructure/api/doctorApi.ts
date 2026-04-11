import axiosClient from './axiosClient';
import type { ApiResponse } from '../../core/types/api.response';
import type { AxiosResponse } from 'axios';

export interface VisitedDoctor {
    id: string;
    fullName: string;
    specialtyName: string;
    experienceYears: number;
    consultationFee: number;
    rating?: number;
    avatar?: string;
}

export const doctorApi = {
    getVisitedDoctors: async (): Promise<AxiosResponse<ApiResponse<VisitedDoctor[]>>> => {
        return axiosClient.get('/doctors/visited');
    },
};