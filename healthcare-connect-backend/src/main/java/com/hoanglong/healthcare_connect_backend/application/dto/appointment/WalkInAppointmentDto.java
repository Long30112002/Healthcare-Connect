package com.hoanglong.healthcare_connect_backend.application.dto.appointment;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WalkInAppointmentDto {
    UUID id;
    String patientName;
    String patientPhone;
    LocalDateTime appointmentDate;
    String doctorName;
    UUID doctorId;
    String symptoms;
    boolean hasMedicalRecord;
}