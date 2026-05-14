package com.hoanglong.healthcare_connect_backend.application.dto.doctor;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PublicDoctorResponse {
    UUID id;
    String fullName;
    String specialtyName;
    String hospitalName;
    String hospitalAddress;
    Integer experienceYears;
    String degree;
    BigDecimal consultationFee;
    Double averageRating;
    Long totalReviews;
    String avatar;
}