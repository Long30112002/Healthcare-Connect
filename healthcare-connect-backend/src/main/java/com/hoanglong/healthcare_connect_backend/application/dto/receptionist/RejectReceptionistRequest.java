package com.hoanglong.healthcare_connect_backend.application.dto.receptionist;

import com.hoanglong.healthcare_connect_backend.core.constant.RejectionReason;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RejectReceptionistRequest {

    @NotNull(message = "REASON_REQUIRED")
    private RejectionReason reasonCode;

    private String note;
}