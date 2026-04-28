package com.hoanglong.healthcare_connect_backend.application.dto.schedule;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ScheduleRequest {
    @NotNull(message = "DATE_REQUIRED")
    LocalDate date;

    @NotNull(message = "START_TIME_REQUIRED")
    LocalTime startTime;

    @NotNull(message = "END_TIME_REQUIRED")
    LocalTime endTime;

    @Min(value = 0, message = "PRICE_INVALID")  
    BigDecimal price;

    @Min(value = 1, message = "MAX_PATIENTS_INVALID")
    int maxPatients;

    private UUID roomId;
}