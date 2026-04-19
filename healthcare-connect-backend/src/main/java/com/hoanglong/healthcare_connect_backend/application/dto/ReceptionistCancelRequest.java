package com.hoanglong.healthcare_connect_backend.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReceptionistCancelRequest {

    @NotBlank(message = "REFUND_REASON_REQUIRED")
    String reason;

    @NotBlank(message = "REFUND_METHOD_REQUIRED")
    String refundMethod;

    @PositiveOrZero(message = "REFUND_AMOUNT_INVALID")
    BigDecimal refundAmount;
}