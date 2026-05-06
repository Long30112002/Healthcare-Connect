package com.hoanglong.healthcare_connect_backend.application.dto.statistics.doctor;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)

public class DoctorSummaryDTO {

    Long totalPatients;

    Integer totalPatientsChange;

    Long revenue;

    Integer revenueChange;

    Double averageRating;

    Integer averageRatingChange;

    Long totalPrescriptions;

    Integer totalPrescriptionsChange;
}
