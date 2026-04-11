import type { User } from '../../core/types';
import type { LoginResponse } from '../../core/types/api.response';
import axiosClient from './axiosClient';

export const authApi = {
    login: async (data: { email: string; password: string }): Promise<LoginResponse> => {
        const response = await axiosClient.post('/auth/login', data);
        return response.data.data;
    },

    logout: async (): Promise<void> => {
        await axiosClient.post('/auth/logout', {});
    },

    getMyInfo: async (): Promise<User> => {
        const response = await axiosClient.get('/users/my-info');
        return response.data.data;
    },

    register: async (data: any): Promise<User> => {
        const response = await axiosClient.post('/auth/register', data);
        return response.data.data;
    },

    forgotPassword: async (email: string): Promise<void> => {
        await axiosClient.post('/auth/forgot-password', null, { params: { email } });
    },

    resetPassword: async (data: { code: string; newPassword: string }): Promise<void> => {
        await axiosClient.post('/auth/reset-password', data);
    },

    verifyEmail: async (code: string): Promise<void> => {
        await axiosClient.get('/auth/verify', { params: { code } });
    },
};