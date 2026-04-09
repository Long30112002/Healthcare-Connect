import type { AxiosResponse } from 'axios';
import type { ApiResponse, LoginResponse } from '../../core/types/api.response';
import axiosClient from './axiosClient';

export const authApi = {
    login: async (data: any): Promise<AxiosResponse<ApiResponse<LoginResponse>>> => {
        return axiosClient.post('/auth/login', data);
    },

    logout: async (): Promise<AxiosResponse<ApiResponse<void>>> => {
        return axiosClient.post('/auth/logout', {});
    },

    getMyInfo: async (): Promise<AxiosResponse<ApiResponse<any>>> => {
        return axiosClient.get('/users/my-info');
    },

    register: async (data: any): Promise<AxiosResponse<ApiResponse<any>>> => {
        return axiosClient.post('/auth/register', data);
    },

    forgotPassword: async (email: string): Promise<AxiosResponse<ApiResponse<any>>> => {
        return axiosClient.post('/auth/forgot-password', null, { params: { email } });
    },

    resetPassword: async (data: { code: string; newPassword: string }): Promise<AxiosResponse<ApiResponse<any>>> => {
        return axiosClient.post('/auth/reset-password', data);
    },

    verifyEmail: async (code: string): Promise<AxiosResponse<ApiResponse<any>>> => {
        return axiosClient.get('/auth/verify', { params: { code } });
    },
};