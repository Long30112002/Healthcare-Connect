import axiosClient from './axiosClient';
import type { DepartmentResponse, SpecialtyResponse } from '../../core/types/api.response';
import type { DepartmentRequest, SpecialtyRequest } from '../../core/types/api.request';

export const departmentSpecialtyApi = {
    // ==================== DEPARTMENTS ====================
    
    getDepartments: async (): Promise<DepartmentResponse[]> => {
        const response = await axiosClient.get('/manager/departments');
        return response.data.data;
    },

    createDepartment: async (data: DepartmentRequest): Promise<DepartmentResponse> => {
        const response = await axiosClient.post('/manager/departments', data);
        return response.data.data;
    },

    updateDepartment: async (id: string, data: DepartmentRequest): Promise<DepartmentResponse> => {
        const response = await axiosClient.put(`/manager/departments/${id}`, data);
        return response.data.data;
    },

    deleteDepartment: async (id: string): Promise<void> => {
        await axiosClient.delete(`/manager/departments/${id}`);
    },

    // ==================== SPECIALTIES ====================
    
    getSpecialties: async (): Promise<SpecialtyResponse[]> => {
        const response = await axiosClient.get('/manager/specialties');
        return response.data.data;
    },

    createSpecialty: async (data: SpecialtyRequest): Promise<SpecialtyResponse> => {
            console.log('API createSpecialty - data:', data);  

        const response = await axiosClient.post('/manager/specialties', data);
        return response.data.data;
    },

    updateSpecialty: async (id: string, data: SpecialtyRequest): Promise<SpecialtyResponse> => {
        const response = await axiosClient.put(`/manager/specialties/${id}`, data);
        return response.data.data;
    },

    deleteSpecialty: async (id: string): Promise<void> => {
        await axiosClient.delete(`/manager/specialties/${id}`);
    },
};