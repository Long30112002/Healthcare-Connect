package com.hoanglong.healthcare_connect_backend.application.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ScheduleResponse {
    UUID id;
    UUID doctorId;
    String doctorName;
    LocalDateTime date;
    LocalDateTime startTime;
    LocalDateTime endTime;
    Integer maxPatients;
    Integer currentBookings;
    String status;
    BigDecimal price;
}