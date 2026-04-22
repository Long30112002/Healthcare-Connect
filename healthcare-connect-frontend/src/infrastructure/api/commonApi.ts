import type { Hospital } from '../../core/types';
import type { ApplicationResponse, DepartmentResponse, SpecialtyResponse } from '../../core/types/api.response';
import axiosClient from './axiosClient';



export const commonApi = {
    getDepartments: async (): Promise<DepartmentResponse[]> => {
        const response = await axiosClient.get('/departments');
        return response.data.data;
    },

    getSpecialties: async (): Promise<SpecialtyResponse[]> => {
        const response = await axiosClient.get('/specialties');
        return response.data.data;
    },

    getHospitals: async (): Promise<Hospital[]> => {
        const response = await axiosClient.get('/hospitals');
        return response.data.data;
    },

    getMyApplications: async (): Promise<ApplicationResponse[]> => {
        const response = await axiosClient.get('/users/my-applications');
        return response.data.data;
    },
};