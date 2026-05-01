import type { User } from "../../core/types";
import type { UpdateProfileRequest, ChangePasswordRequest } from "../../core/types/api.request";
import axiosClient from "./axiosClient";


export const userApi = {

updateProfile: async (userId: string, data: UpdateProfileRequest): Promise<User> => {
  const response = await axiosClient.put(`/users/${userId}/profile`, data);
  return response.data.data;
},

changePassword: async (data: ChangePasswordRequest): Promise<void> => {
  await axiosClient.post('/users/change-password', data);
},
}
