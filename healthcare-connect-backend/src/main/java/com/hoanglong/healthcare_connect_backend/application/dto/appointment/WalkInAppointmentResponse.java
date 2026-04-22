package com.hoanglong.healthcare_connect_backend.application.dto.appointment;

import com.hoanglong.healthcare_connect_backend.core.constant.PaymentStatus;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WalkInAppointmentResponse {
    AppointmentResponse appointment;
    PaymentStatus paymentStatus;
    String payUrl;
    String qrCodeUrl;
    String deeplink;
    boolean needPayment;
    String message;
}