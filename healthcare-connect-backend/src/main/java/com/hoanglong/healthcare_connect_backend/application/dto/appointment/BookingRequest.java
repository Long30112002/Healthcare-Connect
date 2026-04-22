package com.hoanglong.healthcare_connect_backend.application.dto.appointment;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingRequest {
    UUID scheduleId;
    String symptoms;
}