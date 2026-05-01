import type { CreateReviewRequest, UpdateReviewRequest } from "../../core/types/api.request";
import type { DoctorRatingResponse, DoctorReviewResponse, PageResponse, ReviewResponse } from "../../core/types/api.response";
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

    // Tạo đánh giá mới
    createReview: async (data: CreateReviewRequest): Promise<ReviewResponse> => {
        const response = await axiosClient.post('/reviews', data);
        return response.data.data;
    },

    // Cập nhật đánh giá
    updateReview: async (reviewId: string, data: UpdateReviewRequest): Promise<ReviewResponse> => {
        const response = await axiosClient.put(`/reviews/${reviewId}`, data);
        return response.data.data;
    },

    // Lấy đánh giá theo appointmentId
    getReviewByAppointmentId: async (appointmentId: string): Promise<ReviewResponse> => {
        const response = await axiosClient.get(`/reviews/appointment/${appointmentId}`);
        return response.data.data;
    },

    // Kiểm tra đã đánh giá chưa
    hasReviewed: async (appointmentId: string): Promise<boolean> => {
        const response = await axiosClient.get(`/reviews/appointment/${appointmentId}/exists`);
        return response.data.data;
    },

    getDoctorRating: async (doctorId: string): Promise<DoctorRatingResponse> => {
        const response = await axiosClient.get(`/reviews/doctor/${doctorId}/rating`);
        return response.data.data;
    },
};