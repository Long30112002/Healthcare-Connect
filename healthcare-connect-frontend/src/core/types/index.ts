import { UserRole, AppointmentStatus, PaymentStatus, ScheduleStatus, DoctorStatus, PaymentMethod, RoomStatus, MedicineCategory, ReceptionistStatus, Unit, DosageForm, MedicalCategory } from '../constants/enums';
import type { DepartmentResponse } from './api.response';

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
    cancelReason?: string;
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


export interface PrescriptionItem {
    id: string;
    medicineId: string;
    medicineName: string;
    medicineCode: string;
    medicineUnit: string;
    quantity: number;
    dosage: string;
    frequency: string;
    duration: number;
    instructions: string;
    unitPrice: number;
    totalPrice: number;
}

export interface Prescription {
    id: string;
    prescriptionDate: number[];
    note: string;
    totalAmount: number;
    status: string;
    validUntil: number[];
    valid: boolean;
    items: PrescriptionItem[];
}


export interface Medicine {
    id: string;
    code: string;
    name: string;
    activeIngredient: string;
    category: MedicineCategory;
    unit: Unit;
    price: number;
    stockQuantity: number;
    requiresPrescription: boolean;
    dosageForm: DosageForm;
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

// Dashboard Stats
export interface ManagerDashboardStats {
    totalDoctors: number;
    totalDoctorsChange: number;
    totalReceptionists: number;
    totalReceptionistsChange: number;
    totalAppointmentsToday: number;
    totalAppointmentsTodayChange: number;
    revenueThisMonth: number;
    revenueThisMonthChange: number;
}

// Receptionist for Manager
export interface ReceptionistForManager {
    id: string;
    receptionistCode: string;
    fullName: string;
    email: string;
    phone: string;
    hospitalName: string; 
    status: ReceptionistStatus;
    cvUrl: string;
    rejectionReason?: string;
    rejectionNote?: string;
    createdAt: string;
    updatedAt: string;
}


export interface Department {
    id: string;
    name: string;
    code: string;
    description: string;
    category: MedicalCategory;
}

export interface Specialty {
    id: string;
    name: string;
    code: string;
    description: string;
    departmentId: string;
    department: DepartmentResponse;
    category: MedicalCategory;
}

export interface SystemConfig {
    id: string;
    configKey: string;
    configValue: string;
    configType: string;
    groupName: string;
    displayName: string;
    description: string;
    displayOrder: number;
    isActive: boolean;
    updatedAt: string;
    updatedByName?: string;
}


export interface DashboardStats {
  totalUsers: number;
  totalUsersChange: number;
  totalDoctors: number;
  totalDoctorsChange: number;
  totalHospitals: number;
  totalHospitalsChange: number;
  totalBookings: number;
  totalBookingsChange: number;
  todayBookings: number;
  weekBookings: number;
  monthBookings: number;
  paymentRate: number;
  cancelRate: number;
  noShowRate: number;
}

export interface TopHospital {
  id: string;
  name: string;
  address: string;
  doctorCount: number;
  bookingCount: number;
  revenue: number;
  rank: number;
}

export interface UserTrend {
  month: number;
  year: number;
  count: number;
}