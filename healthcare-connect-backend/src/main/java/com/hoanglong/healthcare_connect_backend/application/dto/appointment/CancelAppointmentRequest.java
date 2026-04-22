package com.hoanglong.healthcare_connect_backend.application.dto.appointment;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CancelAppointmentRequest {
    String reason;
}