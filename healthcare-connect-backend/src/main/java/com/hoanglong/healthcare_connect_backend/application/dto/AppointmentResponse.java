package com.hoanglong.healthcare_connect_backend.application.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AppointmentResponse {
    UUID id;
    String patientName;
    String doctorName;
    String hospitalName;
    LocalDate appointmentDate;
    LocalTime startTime;
    LocalTime endTime;
    String symptoms;
    String status;
    double price;
    boolean isPaid;
}
