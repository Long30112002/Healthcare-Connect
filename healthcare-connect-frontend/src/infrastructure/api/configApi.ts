import type { SystemConfig } from "../../core/types";
import axiosClient from "./axiosClient";

export const configApi = {
    getAllConfigs: async (): Promise<Record<string, string>> => {
        const response = await axiosClient.get('/configs');
        return response.data.data;
    },

    getConfig: async (key: string): Promise<string> => {
        const response = await axiosClient.get(`/configs/${key}`);
        return response.data.data;
    },

    // Admin APIs (cần role ADMIN)
    getAllConfigsForAdmin: async (): Promise<SystemConfig[]> => {
        const response = await axiosClient.get('/admin/configs');
        return response.data.data;
    },

    getConfigsByGroup: async (groupName: string): Promise<SystemConfig[]> => {
        const response = await axiosClient.get(`/admin/configs/group/${groupName}`);
        return response.data.data;
    },

    updateConfig: async (key: string, value: string, description?: string, isActive?: boolean): Promise<SystemConfig> => {
        const response = await axiosClient.put(`/admin/configs/${key}`, {
            configValue: value,
            description,
            isActive
        });
        return response.data.data;
    },

    createConfig: async (config: Partial<SystemConfig>): Promise<SystemConfig> => {
        const response = await axiosClient.post('/admin/configs', config);
        return response.data.data;
    },

    deleteConfig: async (key: string): Promise<void> => {
        await axiosClient.delete(`/admin/configs/${key}`);
    },

    uploadImage: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axiosClient.post('/admin/configs/upload-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data;
    }
};