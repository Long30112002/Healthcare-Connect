package com.hoanglong.healthcare_connect_backend.application.dto.doctor;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TopDoctorResponse {
    UUID id;
    String fullName;
    String specialtyName;
    Integer experienceYears;
    Double averageRating;
    Long totalReviews;
}