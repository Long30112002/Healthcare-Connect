package com.hoanglong.healthcare_connect_backend.application.dto.doctor;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.UUID;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VisitedDoctorResponse {
    UUID id;
    String fullName;
    String specialtyName;
    Integer experienceYears;
    BigDecimal consultationFee;
    Double rating;
    String avatar;
}