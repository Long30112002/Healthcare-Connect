import axiosClient from './axiosClient';
import type { PageResponse, PublicDoctorDetailResponse, PublicDoctorResponse } from '../../core/types/api.response';

export interface PublicDoctorSearchParams {
    keyword?: string;
    specialtyId?: string;
    hospitalId?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: 'asc' | 'desc';
}


export const publicDoctorApi = {
    getDoctors: async (params: PublicDoctorSearchParams): Promise<PageResponse<PublicDoctorResponse>> => {
        const response = await axiosClient.get('/public/doctors', { params });
        return response.data.data;
    },

    getDoctorDetail: async (id: string): Promise<PublicDoctorDetailResponse> => {
        const response = await axiosClient.get(`/public/doctors/${id}`);
        return response.data.data;
    },
};