package com.hoanglong.healthcare_connect_backend.application.dto.statistics.manager;

import lombok.Builder;
import lombok.Data;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TopDoctorResponse {
    UUID doctorId;
    String doctorName;
    String specialtyName;
    long totalRevenueCollected;
    long totalRevenueCompleted;
    long totalPatientsCompleted;
    long totalBookingsPaid;
    double averageRating;
    int rank;
}