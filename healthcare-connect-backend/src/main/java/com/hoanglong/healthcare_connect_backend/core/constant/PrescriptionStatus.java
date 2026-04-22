package com.hoanglong.healthcare_connect_backend.core.constant;

public enum PrescriptionStatus {
    ACTIVE("Đang sử dụng"),
    COMPLETED("Đã hoàn thành"),
    EXPIRED("Đã hết hạn"),
    CANCELLED("Đã hủy");

    private final String displayName;

    PrescriptionStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}