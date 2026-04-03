package com.hoanglong.healthcare_connect_backend.core.constant;

public enum AppointmentStatus {
    AWAITING_PAYMENT, // Vừa bấm đặt, đợi thanh toán (Lock slot 15p)
    CONFIRMED,        // Đã thanh toán 100%, lịch khám hợp lệ
    IN_PROGRESS,      // Bác sĩ đã nhấn bắt đầu khám
    COMPLETED,        // Đã hoàn thành buổi khám & có kết quả
    CANCELLED,        // Lịch bị hủy (User hoặc Bác sĩ)
    RESCHEDULED,      // Trạng thái của lịch cũ sau khi đã đổi sang giờ mới
    NO_SHOW           // Quá giờ khám mà bệnh nhân không đến
}