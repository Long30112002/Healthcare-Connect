import type { MedicineCategory } from '../../core/constants/enums';
import type { MedicineResponse, PageResponse } from '../../core/types/api.response';
import axiosClient from './axiosClient';


export interface MedicineSearchParams {
    keyword?: string;
    category?: MedicineCategory;
    requiresPrescription?: boolean;
    page?: number;
    size?: number;
}

export const medicineApi = {
    search: async (keyword: string, page = 0, size = 20): Promise<PageResponse<MedicineResponse>> => {
        const response = await axiosClient.get(`/medicines/search`, {
            params: { keyword, page, size }
        });
        return response.data.data;
    },

    getAll: async (page = 0, size = 20, sortBy = 'name', direction = 'asc'): Promise<PageResponse<MedicineResponse>> => {
        const response = await axiosClient.get(`/medicines`, {
            params: { page, size, sortBy, direction }
        });
        return response.data.data;
    },

    getById: async (id: string): Promise<MedicineResponse> => {
        const response = await axiosClient.get(`/medicines/${id}`);
        return response.data.data;
    },

    getByCategory: async (category: MedicineCategory, page = 0, size = 20): Promise<PageResponse<MedicineResponse>> => {
        const response = await axiosClient.get(`/medicines/category/${category}`, {
            params: { page, size }
        });
        return response.data.data;
    },

    getPrescriptionMedicines: async (page = 0, size = 20): Promise<PageResponse<MedicineResponse>> => {
        const response = await axiosClient.get(`/medicines/prescription-only`, {
            params: { page, size }
        });
        return response.data.data;
    },

    advancedSearch: async (params: MedicineSearchParams): Promise<PageResponse<MedicineResponse>> => {
        const response = await axiosClient.get(`/medicines/advanced-search`, { params });
        return response.data.data;
    }
};