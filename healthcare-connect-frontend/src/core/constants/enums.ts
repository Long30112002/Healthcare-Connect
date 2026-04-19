export const UserRole = {
    PATIENT: 'PATIENT',
    DOCTOR: 'DOCTOR',
    ADMIN: 'ADMIN',
    HOSPITAL_MANAGER: 'HOSPITAL_MANAGER',
    RECEPTIONIST: 'RECEPTIONIST',

} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];


export const AppointmentStatus = {
    AWAITING_PAYMENT: 'AWAITING_PAYMENT', // Vừa bấm đặt, đợi thanh toán (Lock slot 15p)
    CONFIRMED: 'CONFIRMED',        // Đã thanh toán 100%, lịch khám hợp lệ
    IN_PROGRESS: 'IN_PROGRESS',      // Bác sĩ đã nhấn bắt đầu khám
    COMPLETED: 'COMPLETED',        // Đã hoàn thành buổi khám & có kết quả
    CANCELLED: 'CANCELLED',        // Lịch bị hủy (User hoặc Bác sĩ)
    RESCHEDULED: 'RESCHEDULED',      // Trạng thái của lịch cũ sau khi đã đổi sang giờ mới
    NO_SHOW: 'NO_SHOW'           // Quá giờ khám mà bệnh nhân không đến
} as const;
export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

export const PaymentStatus = {
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED',
    CANCELLED: 'CANCELLED'
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentMethod = {
    CASH: 'CASH',
    MOMO: 'MOMO',
    VNPAY: 'VNPAY',
    BANK_TRANSFER: 'BANK_TRANSFER',
    CREDIT_CARD: 'CREDIT_CARD'
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const RoomStatus = {
    AVAILABLE: 'AVAILABLE',
    OCCUPIED: 'OCCUPIED',
    MAINTENANCE: 'MAINTENANCE'
} as const;
export type RoomStatus = (typeof RoomStatus)[keyof typeof RoomStatus];


export const ScheduleStatus = {
    AVAILABLE: 'AVAILABLE',
    FULL: 'FULL',
    CANCELLED: 'CANCELLED'
} as const;
export type ScheduleStatus = (typeof ScheduleStatus)[keyof typeof ScheduleStatus];

export const DoctorStatus = {
    PENDING: 'PENDING',    // 1. Mới nộp hồ sơ, chờ Admin kiểm tra bằng cấp
    VERIFIED: 'VERIFIED',   // 2. Admin đã xác thực hồ sơ xong, chờ Bệnh viện tiếp nhận
    APPROVED: 'APPROVED',   // 3. Bệnh viện đã duyệt, bác sĩ chính thức hoạt động (Chốt Role)
    REJECTED: 'REJECTED',   // 4. Hồ sơ bị từ chối (bởi Admin hoặc Manager)
    INACTIVE: 'INACTIVE',    // 5. Bác sĩ đã nghỉ việc hoặc bị khóa tài khoản
    ARCHIVED: 'ARCHIVED'    // 5. Bác sĩ đã nghỉ việc hoặc bị khóa tài khoản
} as const;
export type DoctorStatus = (typeof DoctorStatus)[keyof typeof DoctorStatus];

export const HospitalStatus = {
    PENDING_CONFIRMATION: 'PENDING_CONFIRMATION',
    ACTIVE: 'ACTIVE',
    REJECTED: 'REJECTED',
    EXPIRED: 'EXPIRED'
} as const;
export type HospitalStatus = (typeof HospitalStatus)[keyof typeof HospitalStatus];

export const RejectionReason = {
    INVALID_CERTIFICATE: 'INVALID_CERTIFICATE',
    INSUFFICIENT_EXPERIENCE: 'INSUFFICIENT_EXPERIENCE',
    OTHER: 'OTHER',

} as const;
export type RejectionReason = (typeof RejectionReason)[keyof typeof RejectionReason];

export const RefundMethod = {
    MOMO: 'MOMO',
    CASH: 'CASH',
    BANK_TRANSFER: 'BANK_TRANSFER',
    VNPAY: 'VNPAY',
    WALLET: 'WALLET',

} as const;
export type RefundMethod = (typeof RefundMethod)[keyof typeof RefundMethod];

