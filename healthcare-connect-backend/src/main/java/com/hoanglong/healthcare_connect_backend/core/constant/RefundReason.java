package com.hoanglong.healthcare_connect_backend.core.constant;

public enum RefundReason {
    CUSTOMER_CANCELLED("Khách hàng hủy"),
    WRONG_APPOINTMENT("Sai lịch hẹn"),
    DOCTOR_UNAVAILABLE("Bác sĩ bận"),
    DUPLICATE_BOOKING("Đặt lịch trùng"),
    TECHNICAL_ISSUE("Lỗi kỹ thuật"),
    OTHER("Lý do khác");

    private final String displayName;

    RefundReason(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}