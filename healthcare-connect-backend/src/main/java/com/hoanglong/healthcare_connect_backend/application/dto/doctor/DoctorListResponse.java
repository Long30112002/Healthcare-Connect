package com.hoanglong.healthcare_connect_backend.application.dto.doctor;

import lombok.Builder;
import lombok.Data;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorListResponse {
    UUID id;
    String fullName;
    String specialtyName;
    String hospitalName;
    Integer experienceYears;
    BigDecimal consultationFee;
    Double rating;
    String avatar;
    Integer availableSchedules;
}