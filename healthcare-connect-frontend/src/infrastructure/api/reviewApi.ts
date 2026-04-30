import type { DoctorRatingResponse, DoctorReviewResponse, PageResponse } from "../../core/types/api.response";
import axiosClient from "./axiosClient";



export const reviewApi = {
    getMyReviews: async (page: number = 0, size: number = 10): Promise<PageResponse<DoctorReviewResponse>> => {
        const response = await axiosClient.get(`/reviews/doctor/my-reviews?page=${page}&size=${size}`);
        return response.data.data;
    },

    getMyRating: async (): Promise<DoctorRatingResponse> => {
        const response = await axiosClient.get('/reviews/doctor/my-rating');
        return response.data.data;
    },
};