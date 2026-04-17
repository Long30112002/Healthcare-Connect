package com.hoanglong.healthcare_connect_backend.application.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AppointmentResponse
{
    UUID id;
    String patientName;
    String doctorName;
    String hospitalName;
    UUID doctorId;
    LocalDateTime appointmentDate;
    LocalDateTime startTime;
    LocalDateTime endTime;
    String symptoms;
    String status;
    double price;
    boolean isPaid;
    UUID roomId;
    String roomNumber;
    Integer roomFloor;
    String patientPhone;
    String bookingType;
}