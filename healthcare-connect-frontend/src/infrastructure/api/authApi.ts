import type { AxiosResponse } from 'axios';
import type { ApiResponse, LoginResponse } from '../../core/types/api.response';
import axiosClient from './axiosClient';

export const authApi = {
    login: async (data: any): Promise<AxiosResponse<ApiResponse<LoginResponse>>> => {
        return axiosClient.post('/auth/login', data);
    },

    logout: async (): Promise<AxiosResponse<ApiResponse<void>>> => {
        // Backend sẽ nhận diện user qua Cookie và thực hiện xóa/hủy token
        return axiosClient.post('/auth/logout', {});
    },
    
    getMyInfo: async (): Promise<AxiosResponse<ApiResponse<any>>> => {
        // withCredentials sẽ tự gửi Cookie
        return axiosClient.get('/users/my-info');
    }
};