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

export interface UpdateProfileRequest {
  fullName: string;
  phone: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface UpdateDoctorInfoRequest {
    degree?: string;
    experienceYears?: number;
    biography?: string;
    consultationFee?: number;
}

export interface WorkingHoursRequest {
  dayOfWeek: number;        // 2=T3,3=T4,4=T5,5=T6,6=T7,7=CN,8=T2
  startTime: string;        // "07:30"
  endTime: string;          // "17:00"
  lunchStart: string | null;
  lunchEnd: string | null;
  minSlotMinutes: number;
  maxSlotMinutes: number;
  isActive?: boolean;
}