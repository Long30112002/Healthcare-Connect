package com.hoanglong.healthcare_connect_backend.core.constant;

public enum RejectionReason {
    INVALID_DEGREE("Bằng cấp không hợp lệ hoặc không rõ ràng"),
    MISSING_DOCUMENTS("Hồ sơ còn thiếu các giấy tờ quan trọng"),
    INSUFFICIENT_EXPERIENCE("Kinh nghiệm làm việc chưa đạt yêu cầu"),
    PROFILE_MISMATCH("Thông tin cá nhân không khớp với bằng cấp"),
    OTHER("Lý do khác (Cần liên hệ hỗ trợ)");

    private final String message;
    RejectionReason(String message) { this.message = message; }
    public String getMessage() { return message; }
}