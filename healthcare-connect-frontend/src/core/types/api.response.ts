import type { User } from ".";
import type { AppointmentStatus } from "../constants/enums";

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
