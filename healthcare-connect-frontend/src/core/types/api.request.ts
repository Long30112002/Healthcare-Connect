import type { VitalSigns } from ".";
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

export interface PrescriptionItemRequest {
    medicineId: string;
    quantity: number;
    dosage: string;
    frequency: string;
    duration: number;
    instructions?: string;
}

export interface PrescriptionRequest {
    note?: string;
    validUntil?: string;  // ISO date
    items: PrescriptionItemRequest[];
}

export interface CreateMedicalRecordRequest {
    appointmentId: string;
    diagnosis: string;
    symptoms?: string;
    notes?: string;
    vitalSigns?: VitalSigns;
    followUpDate?: string;  // ISO date
    prescriptions?: PrescriptionRequest[];
}

export interface CreateReviewRequest {
    appointmentId: string;
    rating: number;
    comment?: string;
    isAnonymous?: boolean;
}

export interface UpdateReviewRequest {
    rating: number;
    comment?: string;
    isAnonymous?: boolean;
    appointmentId: string;
}