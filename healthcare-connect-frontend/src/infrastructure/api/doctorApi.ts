import axiosClient from './axiosClient';
import type { ApiResponse } from '../../core/types/api.response';
import type { AxiosResponse } from 'axios';
import type { VisitedDoctor } from '../../core/types';

export const doctorApi = {
    getVisitedDoctors: async (): Promise<AxiosResponse<ApiResponse<VisitedDoctor[]>>> => {
        return axiosClient.get('/doctors/visited');
    },
};