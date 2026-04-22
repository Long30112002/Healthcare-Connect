package com.hoanglong.healthcare_connect_backend.application.dto.payment;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentStatusResponse {
    String status;
    boolean paid;
    String payUrl;
}