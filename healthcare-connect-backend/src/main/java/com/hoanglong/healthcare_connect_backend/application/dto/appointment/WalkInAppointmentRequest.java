package com.hoanglong.healthcare_connect_backend.application.dto.appointment;

import com.hoanglong.healthcare_connect_backend.core.constant.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WalkInAppointmentRequest {

    @NotBlank(message = "NAME_INVALID")
    @Size(min = 2, max = 100, message = "NAME_INVALID")
    private String patientName;

    @NotBlank(message = "PHONE_INVALID")
    @Pattern(regexp = "^(0|\\+84)[0-9]{9,10}$", message = "PHONE_INVALID")
    private String patientPhone;

    @Size(max = 500, message = "SYMPTOMS_TOO_LONG")
    private String symptoms;

    @NotNull(message = "SCHEDULE_ID_REQUIRED")
    private UUID scheduleId;

    @NotNull(message = "PAYMENT_METHOD_REQUIRED")
    private PaymentMethod paymentMethod;
}