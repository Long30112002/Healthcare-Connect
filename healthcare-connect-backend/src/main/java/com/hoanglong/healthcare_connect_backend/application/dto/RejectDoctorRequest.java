package com.hoanglong.healthcare_connect_backend.application.dto;

import com.hoanglong.healthcare_connect_backend.core.constant.RejectionReason;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)

public class RejectDoctorRequest {
    @NotNull(message = "REASON_REQUIRED")
    RejectionReason reasonCode;
    String note;
}
