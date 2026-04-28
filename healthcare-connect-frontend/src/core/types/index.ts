import { UserRole, AppointmentStatus, PaymentStatus, ScheduleStatus, DoctorStatus, PaymentMethod, RoomStatus, MedicineCategory } from '../constants/enums';

export interface User {
    id: string;
    email: string;
    fullName: string;
    phone: string;
    role: UserRole;
    createdAt?: string;
}

export interface Doctor {
    id: string;
    doctorCode: string;
    fullName: string;
    email: string;
    phone: string;
    degree: string;
    experienceYears: number;
    biography: string;
    cvUrl: string;
    consultationFee: number;
    status: DoctorStatus;
    specialtyName: string;
    departmentName: string;
    hospitalName: string;
}

export interface ScheduleSlot {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    price: number;
    currentBookings: number;
    maxPatients: number;
}


export interface DoctorDetail {
    id: string;
    fullName: string;
    specialtyName: string;
    hospitalName: string;
    address: string;
    experienceYears: number;
    degree: string;
    biography: string;
    consultationFee: number;
    rating: number;
    avatar: string | null;
    schedules: ScheduleSlot[];
}

export interface Room {
    id: string;
    roomNumber: string;
    floor: number;
    building: string;
    status: RoomStatus;
    deleted: boolean;
}


export interface Schedule {
    id: string;
    doctor: Doctor;
    date: string;
    startTime: string;
    endTime: string;
    maxPatients: number;
    currentBookings: number;
    status: ScheduleStatus;
    price: number;
}

export interface Payment {
    id: string;
    amount: number;
    refundAmount?: number;
    paymentMethod: PaymentMethod;
    transactionNo?: string;
    status: PaymentStatus;
    createdAt: string;
}

export interface Hospital {
    id: string;
    name: string;
    address: string;
    description: string;
    imageUrl: string;
    managerEmail: string;
    hotline?: string;
}


export interface Appointment {
    paymentMethod: PaymentMethod;
    id: string;
    patientName: string;
    hasMedicalRecord?: boolean;
    patientId?: string;
    patientPhone?: string;
    patientEmail?: string;
    doctorName: string;
    doctorId?: string;
    hospitalName: string;
    specialtyName?: string;
    startTime: number[];
    endTime: number[];
    symptoms: string;
    status: AppointmentStatus;
    price: number;
    paid: boolean;
    phone?: string;
    roomNumber?: string;
    roomFloor?: number;
    checkInTime?: number[];
}

export interface VisitedDoctor {
    id: string;
    fullName: string;
    specialtyName: string;
    experienceYears: number;
    consultationFee: number | null;
    rating: number;
    avatar: string | null;
}


export interface DoctorListItem {
    id: string;
    fullName: string;
    specialtyName: string;
    hospitalName: string;
    experienceYears: number;
    consultationFee: number;
    rating: number;
    avatar: string | null;
    availableSchedules: number;
}

export interface Medicine {
    id: string;
    code: string;
    name: string;
    activeIngredient: string;
    category: MedicineCategory;
    unit: string;
    price: number;
    stockQuantity: number;
    requiresPrescription: boolean;
    dosageForm: string;
    manufacturer: string;
    expiryDate: string;
    description: string;
    usageInstructions: string;
    contraindications: string;
    sideEffects: string;
}

export interface VitalSigns {
    bloodPressure?: string;  // VD: "120/80"
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    bmi?: number;
    note?: string;
}

