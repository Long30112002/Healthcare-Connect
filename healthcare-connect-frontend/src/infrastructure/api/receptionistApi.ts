import type { Appointment, DoctorDetail, DoctorListItem, Room } from "../../core/types";
import type { CancelAppointmentRequest, WalkInAppointmentRequest, WalkInAppointmentResponse } from "../../core/types/api.request";
import type { DashboardStatistics, PageResponse, StatisticsResponse, HourlyStatistic, DoctorStatistic, DailyStatistic, PaymentQRResponse } from "../../core/types/api.response";
import { getMockAppointments, getMockStatisticsByFilter, mockCheckIn } from "../../shared/mock/receptionistMock";
import axiosClient from "./axiosClient";

const USE_MOCK = false;

export const receptionistApi = {

    async getAppointments(filter: string, page: number, size: number): Promise<PageResponse<Appointment>> {
        if (USE_MOCK) {
            return new Promise(resolve => setTimeout(() => { resolve(getMockAppointments(filter, page, size)); }, 200));
        }
        const response = await axiosClient.get(`/receptionist/appointments?filter=${filter}&page=${page}&size=${size}`);
        return response.data.data;
    },

    async getDashboardStatistics(filter: string): Promise<DashboardStatistics> {
        if (USE_MOCK) {
            return new Promise(resolve => setTimeout(() => { resolve(getMockStatisticsByFilter(filter)); }, 100));
        }
        const response = await axiosClient.get(`/receptionist/statistics/dashboard?filter=${filter}`);
        return response.data.data;
    },

    async checkIn(appointmentId: string, filter?: string): Promise<void> {
        if (USE_MOCK && filter) {
            return new Promise(resolve => {
                setTimeout(() => { mockCheckIn(filter, appointmentId); resolve(); }, 200);
            });
        }
        await axiosClient.patch(`/receptionist/appointments/${appointmentId}/check-in`);
    },

    createOfflineAppointment: async (data: { patientName: string; phone: string; symptoms: string; doctorId: string; scheduleId: string; }): Promise<Appointment> => {
        const response = await axiosClient.post('/receptionist/appointments/offline', data);
        return response.data.data;
    },

    async searchAppointments(keyword: string): Promise<{ data: Appointment[] }> {
        const response = await axiosClient.get(`/receptionist/appointments/search?keyword=${keyword}`);
        return response.data;
    },


    async getSummaryStatistics(startDate?: string, endDate?: string): Promise<StatisticsResponse> {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const response = await axiosClient.get(`/receptionist/statistics/summary?${params.toString()}`);
        return response.data;
    },

    async getStatisticsByPeriod(period: string): Promise<StatisticsResponse> {
        const response = await axiosClient.get(`/receptionist/statistics/by-period?period=${period}`);
        return response.data;
    },

    async getHourlyStatistics(startDate?: string, endDate?: string): Promise<HourlyStatistic[]> {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const response = await axiosClient.get(`/receptionist/statistics/hourly?${params.toString()}`);
        return response.data;
    },

    async getDoctorStatistics(startDate?: string, endDate?: string): Promise<DoctorStatistic[]> {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const response = await axiosClient.get(`/receptionist/statistics/doctors?${params.toString()}`);
        return response.data;
    },

    async getDailyStatistics(startDate?: string, endDate?: string): Promise<DailyStatistic[]> {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const response = await axiosClient.get(`/receptionist/statistics/daily?${params.toString()}`);
        return response.data;
    },

    async createWalkInAppointment(data: WalkInAppointmentRequest): Promise<WalkInAppointmentResponse> {
        const response = await axiosClient.post('/receptionist/walk-in', data);
        return response.data.data;
    },

    // async cancelAppointment(appointmentId: string, reason?: string): Promise<void> {
    //     await axiosClient.post(`/receptionist/appointments/${appointmentId}/cancel`, { reason: reason || 'Hủy tại quầy' });
    // },

    async getRooms(): Promise<Room[]> {
        const response = await axiosClient.get('/rooms');
        return response.data.data;
    },

    async getAvailableRooms(): Promise<Room[]> {
        const response = await axiosClient.get('/rooms/available');
        return response.data.data;
    },

    async getAvailableDoctors(date?: string, days?: number): Promise<DoctorListItem[]> {
        const params = new URLSearchParams();
        if (date) params.append('date', date);
        if (days) params.append('days', days.toString());
        const response = await axiosClient.get(`/receptionist/doctors/available?${params.toString()}`);
        return response.data.data;
    },

    async getDoctorSchedules(doctorId: string): Promise<DoctorDetail> {
        const response = await axiosClient.get(`/receptionist/doctors/${doctorId}/schedules`);
        return response.data.data;
    },

    getPaymentStatus: async (appointmentId: string): Promise<{ paymentStatus: string }> => {
        const response = await axiosClient.get(`/receptionist/payments/${appointmentId}/status`);
        return response.data.data;
    },

    cancelAppointment: async (appointmentId: string, data: CancelAppointmentRequest): Promise<void> => {
        await axiosClient.post(`/receptionist/appointments/${appointmentId}/cancel`, data);
    },

    getPaymentQR: async (appointmentId: string): Promise<PaymentQRResponse> => {
        const response = await axiosClient.get(`/receptionist/payments/${appointmentId}/qr`);
        return response.data.data;
    },
};