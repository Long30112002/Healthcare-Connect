package com.hoanglong.healthcare_connect_backend.core.constant;

public enum MedicalRecordStatus
{
    ACTIVE("Đang điều trị"),
    COMPLETED("Đã hoàn thành"),
    ARCHIVED("Đã lưu trữ"),
    CANCELLED("Đã hủy");

    private final String displayName;

    MedicalRecordStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
