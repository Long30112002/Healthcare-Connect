import axiosClient from './axiosClient';

export const hospitalsApi = {
  acceptInvitation: async (data: { token: string; hospitalId: string }) => {
    const response = await axiosClient.post('/hospitals/accept-invitation', data);
    return response.data.data;
  },
};