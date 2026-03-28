package com.hoanglong.healthcare_connect_backend.application.dto;

import com.hoanglong.healthcare_connect_backend.core.constant.RejectionReason;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RejectDoctorRequest {
    @NotNull(message = "REASON_REQUIRED")
    private RejectionReason reasonCode; // Chọn từ Enum trên

    private String note; // Ghi chú thêm nếu chọn lý do OTHER
}
