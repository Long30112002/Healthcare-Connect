import type { Appointment, User, VitalSigns } from ".";
import type { AppointmentStatus, DoctorStatus, DosageForm, MedicalCategory, MedicineCategory, PaymentStatus, ReceptionistStatus, RejectionReason, ScheduleStatus, Unit, UserRole } from "../constants/enums";

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

export interface WorkingHoursResponse {
    config: any;
    id: string;
    hospitalId: string;
    hospitalName: string;
    dayOfWeek: number;
    dayName: string;          // "Thứ 2", "Thứ 3", ...
    startTime: string;
    endTime: string;
    lunchStart: string | null;
    lunchEnd: string | null;
    minSlotMinutes: number;
    maxSlotMinutes: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface MedicineResponse {
    id: string;
    code: string;
    name: string;
    activeIngredient: string;
    category: MedicineCategory;
    categoryDisplayName: string;
    dosageForm: DosageForm;
    dosageFormDisplayName: string;
    unit: Unit;
    price: number;
    formattedPrice: string;
    stockQuantity: number;
    minStock: number;
    maxStock: number;
    expiryDate: string;
    manufacturer: string;
    manufacturerCountry: string;
    requiresPrescription: boolean;
    contraindications: string;
    sideEffects: string;
    description: string;
    usageInstructions: string;
    hospitalId: string;
    hospitalName: string;
    lowStock: boolean;
    expired: boolean;
}

export interface PrescriptionItemResponse {
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

export interface PrescriptionResponse {
    id: string;
    prescriptionDate: number[];  // [year, month, day]
    note: string;
    totalAmount: number;
    status: string;
    validUntil: number[];
    valid: boolean;
    items: PrescriptionItemResponse[];
}

export interface MedicalRecordResponse {
    id: string;
    appointmentId: string;
    patientId: string | null;
    patientName: string;
    patientPhone: string;
    patientEmail: string | null;
    doctorId: string;
    doctorName: string;
    doctorCode: string;
    hospitalId: string;
    hospitalName: string;
    hospitalAddress: string;
    diagnosis: string;
    symptoms: string;
    notes: string;
    vitalSigns: VitalSigns | null;
    followUpDate: number[];
    status: string;
    prescriptionCount: number;
    prescriptions: PrescriptionResponse[];
    createdAt: string | null;
    updatedAt: string | null;
    patientBirthYear?: string;
    patientAddress?: string;
    doctorAdvice?: string;
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

export interface ScheduleRespone {
    id: string;
    doctorId: string;
    doctorName: string;
    date: number[];
    startTime: number[];
    endTime: number[];
    maxPatients: number;
    currentBookings: number;
    status: ScheduleStatus;
    price: number;
    roomId?: string;
    roomNumber?: string;
    roomFloor?: number;
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
    category: MedicalCategory;  
}

export interface SpecialtyResponse {
    id: string;
    name: string;
    code: string;
    description: string;
    department: DepartmentResponse;
    category: MedicalCategory;  
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

export interface WalkInAppointmentItem {
    id: string;
    patientName: string;
    patientPhone: string;
    appointmentDate: number[];
    doctorName: string;
    doctorId: string;
    symptoms: string;
    hasMedicalRecord: boolean;
}

export interface PatientResponse {
    id: string;
    patientId: string | null;
    appointmentId: string;
    patientName: string;
    patientPhone: string;
    patientEmail?: string | null;
    lastVisitDate: number[];
    lastDiagnosis: string;
    totalVisits: number;
    isWalkIn: boolean;
}

export interface DoctorReviewResponse {
    id: string;
    appointmentId: string;
    patientName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface ReviewResponse {
    id: string;
    appointmentId: string;
    patientId: string;
    patientName: string;
    rating: number;
    comment: string;
    isAnonymous: boolean;
    isEdited: boolean;
    canEdit: boolean;
    createdAt: string;
}

export interface DoctorRatingResponse {
    averageRating: number;
    totalReviews: number;
    rating1Count: number;
    rating2Count: number;
    rating3Count: number;
    rating4Count: number;
    rating5Count: number;
}

export interface DoctorResponse {
    id: string;
    doctorCode: string;
    fullName: string;
    email: string;
    phone: string;
    degree: string;
    experienceYears: number;
    biography: string;
    consultationFee: number;
    specialtyName: string;
    departmentName: string;
    hospitalId: string;
    hospitalName: string;
    hospitalAddress: string;
    status: DoctorStatus;
    rejectionReason?: string | null;
    cvUrl?: string; 
    rejectionNote?: string | null;
    createdAt?: string;      
    updatedAt?: string;      
}

export interface ReceptionistForManager {
    id: string;
    receptionistCode: string;
    fullName: string;
    email: string;
    phone: string;
    status: ReceptionistStatus;
    cvUrl: string;
    rejectionReason?: string;
    rejectionNote?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaymentStatusResponse {
    status: string;
    paid: boolean;
    payUrl?: string;
}

export interface PublicTopDoctorResponse  {
    id: string;
    fullName: string;
    specialtyName: string;
    experienceYears: number;
    averageRating: number;
    totalReviews: number;
}

// Top Doctors
export interface TopDoctorResponse {
    doctorId: string;
    doctorName: string;
    specialtyName: string;
    totalRevenueCollected: number;
    totalRevenueCompleted: number;
    totalPatientsCompleted: number;
    totalBookingsPaid: number;
    averageRating: number;
    rank: number;
}

// Appointment Today
export interface AppointmentTodayResponse {
    id: string;
    patientName: string;
    patientPhone: string;
    doctorName: string;
    doctorId: string;
    startTime: string;
    endTime: string;
    appointmentDate: string;
    symptoms: string;
    status: AppointmentStatus;
    paid: boolean;
    price: number;
    roomNumber?: string;
}

// Weekly Statistics
export interface WeeklyStatResponse {
    day: string;
    dayOfWeek: number;
    count: number;
}

// Alert
export interface AlertResponse {
    id: string;
    type: 'warning' | 'danger' | 'info';
    title: string;
    message: string;
    link?: string;
    createdAt: string;
}

export interface PublicDoctorResponse {
    id: string;
    fullName: string;
    specialtyName: string;
    hospitalName: string;
    hospitalAddress: string;
    experienceYears: number;
    degree: string;
    consultationFee: number;
    averageRating: number;
    totalReviews: number;
    avatar: string | null;
}

export interface PublicDoctorDetailResponse {
    id: string;
    fullName: string;
    specialtyName: string;
    departmentName: string;
    hospitalName: string;
    hospitalAddress: string;
    hospitalPhone: string;
    hospitalEmail: string;
    experienceYears: number;
    degree: string;
    biography: string;
    consultationFee: number;
    averageRating: number;
    totalReviews: number;
    avatar: string | null;
    schedules: ScheduleRespone[];
}