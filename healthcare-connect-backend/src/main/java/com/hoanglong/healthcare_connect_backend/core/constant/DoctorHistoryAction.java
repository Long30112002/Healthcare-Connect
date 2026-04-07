package com.hoanglong.healthcare_connect_backend.core.constant;

public enum DoctorHistoryAction {
    CREATE("Tạo mới"),
    UPDATE("Cập nhật"),
    REAPPLY("Gửi lại"),
    VERIFY("Xác thực"),
    APPROVE("Phê duyệt"),
    REJECT("Từ chối"),
    ARCHIVE("Lưu trữ");

    private final String displayName;

    DoctorHistoryAction(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}