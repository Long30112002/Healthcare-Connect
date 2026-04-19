import type { PaymentMethod, PaymentStatus, RefundMethod } from "../constants/enums";

export interface BookingRequest {
    scheduleId: string;
    symptoms: string;
}

export interface WalkInAppointmentRequest {
    patientName: string;
    patientPhone: string;
    symptoms?: string;
    scheduleId: string;
    paymentMethod: PaymentMethod;
}

export interface WalkInAppointmentResponse {
    appointment: {
        id: string;
        patientName: string | null;
        doctorName: string;
        hospitalName: string;
        startTime: number[];
        endTime: number[];
        price: number;
        status: string;
        paid: boolean;
        patientPhone: string;
        bookingType: string;
    };
    paymentStatus: PaymentStatus;
    payUrl?: string;
    qrCodeUrl?: string;
    deeplink?: string;
    needPayment: boolean;
    message: string;
}

export interface RoomRequest {
    roomNumber: string;
    floor?: number;
    building?: string;
}

export interface CancelAppointmentRequest {
    reason: string;
    refundMethod: RefundMethod;
    refundAmount?: number;  
}