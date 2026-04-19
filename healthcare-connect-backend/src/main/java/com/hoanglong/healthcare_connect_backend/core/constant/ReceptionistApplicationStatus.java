package com.hoanglong.healthcare_connect_backend.core.constant;

public enum ReceptionistApplicationStatus {
    CREATE("Tạo mới"),
    UPDATE("Cập nhật"),
    REAPPLY("Gửi lại"),
    VERIFY("Xác thực"),
    APPROVE("Phê duyệt"),
    REJECT("Từ chối"),
    ARCHIVE("Lưu trữ");

    private final String displayName;

    ReceptionistApplicationStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}