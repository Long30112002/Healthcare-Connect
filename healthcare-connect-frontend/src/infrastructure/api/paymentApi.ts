import type { PaymentQRResponse, PaymentStatusResponse } from '../../core/types/api.response';
import axiosClient from './axiosClient';


export const paymentApi = {
    createPayment: async (appointmentId: string): Promise<PaymentQRResponse> => {
        const response = await axiosClient.post(`/payments/momo/create-payment/${appointmentId}`);
        return response.data?.data;
    },

    checkPaymentStatus: async (appointmentId: string): Promise<PaymentStatusResponse> => {
        const response = await axiosClient.get(`/payments/momo/status/${appointmentId}`);
        return response.data?.data || { status: 'unknown', paid: false };
    }
};