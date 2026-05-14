import axiosClient from './axiosClient';
import type { ReviewResponse, PublicTopDoctorResponse  } from '../../core/types/api.response';

export const publicHomeApi = {
    getTopDoctors: async (limit: number = 4): Promise<PublicTopDoctorResponse[]> => {
        const response = await axiosClient.get(`/public/home/top-doctors?limit=${limit}`);
        return response.data.data;
    },

    getFeaturedReviews: async (limit: number = 6): Promise<ReviewResponse[]> => {
        const response = await axiosClient.get(`/public/home/featured-reviews?limit=${limit}`);
        return response.data.data;
    }
};