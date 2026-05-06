import type { WorkingHoursRequest } from '../../core/types/api.request';
import type { WorkingHoursResponse } from '../../core/types/api.response';
import axiosClient from './axiosClient';

export const workingHoursApi = {
    // Lấy tất cả cấu hình giờ làm việc của bệnh viện
    getAllForManager: async (): Promise<WorkingHoursResponse[]> => {
        const response = await axiosClient.get('/manager/working-hours');
        return response.data.data;
    },

    // Lấy cấu hình theo ngày
    getByDay: async (dayOfWeek: number): Promise<WorkingHoursResponse | null> => {
        const response = await axiosClient.get(`/manager/working-hours/day?dayOfWeek=${dayOfWeek}`);
        return response.data.data;
    },

    // Tạo hoặc cập nhật cấu hình
    save: async (data: WorkingHoursRequest): Promise<WorkingHoursResponse> => {
        const response = await axiosClient.post('/manager/working-hours', data);
        return response.data.data;
    },

    // Xóa (vô hiệu hóa) cấu hình của một ngày
    delete: async (dayOfWeek: number): Promise<void> => {
        await axiosClient.delete(`/manager/working-hours?dayOfWeek=${dayOfWeek}`);
    },

    // Khôi phục cấu hình mặc định
    resetToDefault: async (): Promise<void> => {
        await axiosClient.post('/manager/working-hours/reset-default');
    },

    getHospitalWorkingHours: async (): Promise<WorkingHoursResponse[]> => {
        const response = await axiosClient.get('/doctor/hospital-working-hours');
        return response.data.data;
    },
};