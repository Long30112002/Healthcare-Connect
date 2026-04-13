import axiosClient from './axiosClient';

export interface PaymentStatusResponse {
    status: string;
    paid: boolean;
    payUrl?: string;  
}


export const paymentApi = {
    createPayment: async (appointmentId: string): Promise<string> => {
        const response = await axiosClient.post(`/payments/momo/create-payment/${appointmentId}`);
        return response.data?.data;
    },

    checkPaymentStatus: async (appointmentId: string): Promise<PaymentStatusResponse> => {
        const response = await axiosClient.get(`/payments/momo/status/${appointmentId}`);
        return response.data?.data || { status: 'unknown', paid: false };
    }
};