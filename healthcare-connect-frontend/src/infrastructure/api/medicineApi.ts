import axiosClient from './axiosClient';
import type { MedicineResponse, PageResponse } from '../../core/types/api.response';
import type { MedicineCategory } from '../../core/constants/enums';
import type { MedicineRequest } from '../../core/types/api.request';

export interface MedicineSearchParams {
    keyword?: string;
    category?: MedicineCategory;
    requiresPrescription?: boolean;
    page?: number;
    size?: number;
}


export const medicineApi = {
    // Search
    search: async (keyword: string, page = 0, size = 20): Promise<PageResponse<MedicineResponse>> => {
        const response = await axiosClient.get(`/medicines/search`, {
            params: { keyword, page, size }
        });
        return response.data.data;
    },

    // Get all
    getAll: async (page = 0, size = 20, sortBy = 'name', direction = 'asc'): Promise<PageResponse<MedicineResponse>> => {
        console.log('🔵 Gọi API getAll medicines...');
        const response = await axiosClient.get(`/medicines`, {
            params: { page, size, sortBy, direction }
        });
        console.log('🟢 API response:', response.data);
        return response.data.data;
    },

    // Get by ID
    getById: async (id: string): Promise<MedicineResponse> => {
        const response = await axiosClient.get(`/medicines/${id}`);
        return response.data.data;
    },

    // Get by category
    getByCategory: async (category: MedicineCategory, page = 0, size = 20): Promise<PageResponse<MedicineResponse>> => {
        const response = await axiosClient.get(`/medicines/category/${category}`, {
            params: { page, size }
        });
        return response.data.data;
    },

    // Get prescription medicines
    getPrescriptionMedicines: async (page = 0, size = 20): Promise<PageResponse<MedicineResponse>> => {
        const response = await axiosClient.get(`/medicines/prescription-only`, {
            params: { page, size }
        });
        return response.data.data;
    },

    // Advanced search
    advancedSearch: async (params: MedicineSearchParams): Promise<PageResponse<MedicineResponse>> => {
        const response = await axiosClient.get(`/medicines/advanced-search`, { params });
        return response.data.data;
    },

    // Create medicine
    create: async (data: MedicineRequest): Promise<MedicineResponse> => {
        const response = await axiosClient.post(`/medicines`, data);
        return response.data.data;
    },

    // Update medicine
    update: async (id: string, data: MedicineRequest): Promise<MedicineResponse> => {
        const response = await axiosClient.put(`/medicines/${id}`, data);
        return response.data.data;
    },

    // Delete medicine
    delete: async (id: string): Promise<void> => {
        await axiosClient.delete(`/medicines/${id}`);
    },

    // Update stock
    updateStock: async (id: string, quantity: number): Promise<void> => {
        await axiosClient.patch(`/medicines/${id}/stock`, null, {
            params: { quantity }
        });
    },

    // Check stock
    checkStock: async (id: string, quantity: number): Promise<boolean> => {
        const response = await axiosClient.get(`/medicines/${id}/check-stock`, {
            params: { quantity }
        });
        return response.data.data;
    },

    // Get low stock medicines
    getLowStock: async (): Promise<MedicineResponse[]> => {
        const response = await axiosClient.get(`/medicines/low-stock`);
        return response.data.data;
    },

    // Get expiring medicines
    getExpiring: async (): Promise<MedicineResponse[]> => {
        const response = await axiosClient.get(`/medicines/expiring`);
        return response.data.data;
    },

    // Get by code
    getByCode: async (code: string): Promise<MedicineResponse> => {
        const response = await axiosClient.get(`/medicines/code/${code}`);
        return response.data.data;
    },
};