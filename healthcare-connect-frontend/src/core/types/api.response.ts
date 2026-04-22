import type { Appointment, User } from ".";
import type { AppointmentStatus, DoctorStatus, PaymentMethod, PaymentStatus, ReceptionistStatus, RejectionReason, UserRole } from "../constants/enums";

export interface ApiResponse<T> {
    status: string;
    code: number;
    message: string;
    data: T;
    errors?: string[];
}


export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    authenticated: boolean;
    user: User;
}

export interface Pageable {
    pageNumber: number;
    pageSize: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
}

export interface PaginatedResponse<T> {
    content: T[];
    pageable: Pageable;
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

export interface PageResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: { empty: boolean; sorted: boolean; unsorted: boolean };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    totalPages: number;
    totalElements: number;
    last: boolean;
    first: boolean;
    size: number;
    number: number;
    sort: { empty: boolean; sorted: boolean; unsorted: boolean };
    numberOfElements: number;
    empty: boolean;
}

export interface AppointmentResponse {
    id: string;
    patientName: string;
    doctorName: string;
    hospitalName: string;
    appointmentDate: string;     // "2026-04-15"
    startTime: string;           // "08:00:00"
    endTime: string;             // "08:30:00"
    symptoms: string;
    status: AppointmentStatus;
    price: number;
    isPaid: boolean;
    cancelReason?: string;
    checkInTime?: string;
}

export interface PaymentResponse {
    payUrl: string;
    orderId: string;
    amount: number;
}

export interface StatisticsResponse {
    totalAppointments: number;
    checkedIn: number;
    waiting: number;
    cancelled: number;
    noShow: number;
    checkInRate: number;
}

export interface HourlyStatistic {
    hour: number;
    total: number;
    checkedIn: number;
    waiting: number;
}

export interface DoctorStatistic {
    doctorId: string;
    doctorName: string;
    totalPatients: number;
    checkedInPatients: number;
}

export interface DashboardStatistics {
    upcoming: number;
    waiting: number;
    checkedIn: number;
    completed: number;
    cancelled: number;
    noShow: number;
    total: number;
}

export interface HospitalInfo {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
}


export interface DailyStatistic {
    date: string;
    total: number;
    checkedIn: number;
    waiting: number;
}

export interface RoomResponse {
    id: string;
    roomNumber: string;
    floor: number;
    building: string;
    status: string;
}


export interface DepartmentResponse {
    id: string;
    name: string;
    code: string;
    description: string;
}

export interface SpecialtyResponse {
    id: string;
    name: string;
    code: string;
    description: string;
    department: DepartmentResponse;
}

export interface HospitalResponse {
    id: string;
    name: string;
    address: string;
    description: string;
    imageUrl: string;
}

export interface WalkInAppointmentResponse {
    appointment: Appointment;
    paymentStatus: PaymentStatus;
    payUrl?: string;
    qrCodeUrl?: string;
    deeplink?: string;
    needPayment: boolean;
    message: string;
}

export interface PaymentQRResponse {
    payUrl: string;
    qrCodeUrl: string;
    deeplink: string;
}

export interface ApplicationResponse {
    id: string;
    type: UserRole;
    hospitalName: string;
    hospitalId: string;
    status: DoctorStatus | ReceptionistStatus; 
    rejectionReason?: RejectionReason;         
    rejectionNote?: string;
    createdAt: string;
    updatedAt: string;
}

// export interface WalkInAppointmentResponse {
//     appointment: {
//         id: string;
//         patientName: string | null;
//         doctorName: string;
//         hospitalName: string;
//         startTime: number[];
//         endTime: number[];
//         price: number;
//         status: string;
//         paid: boolean;
//         patientPhone: string;
//         bookingType: string;
//     };
//     paymentStatus: PaymentStatus;
//     payUrl?: string;
//     qrCodeUrl?: string;
//     deeplink?: string;
//     needPayment: boolean;
//     message: string;
// }
