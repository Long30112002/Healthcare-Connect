import type { PaymentMethod, RefundMethod } from "../constants/enums";

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

export interface WalkInAppointmentRequest {
    patientName: string;
    patientPhone: string;
    symptoms?: string;
    scheduleId: string;
    paymentMethod: PaymentMethod;
}