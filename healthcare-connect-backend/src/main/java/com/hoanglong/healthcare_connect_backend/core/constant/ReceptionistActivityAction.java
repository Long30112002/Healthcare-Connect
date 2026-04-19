package com.hoanglong.healthcare_connect_backend.core.constant;

public enum ReceptionistActivityAction {
    CREATE_WALK_IN_APPOINTMENT("Tạo lịch walk-in"),
    CHECK_IN("Check-in bệnh nhân"),
    REFUND("Hoàn tiền"),
    CANCEL_APPOINTMENT("Hủy lịch hẹn");

    private final String displayName;

    ReceptionistActivityAction(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}