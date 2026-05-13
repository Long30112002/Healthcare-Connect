package com.hoanglong.healthcare_connect_backend.application.dto.review;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)

public class DoctorReviewResponse {
    UUID id;
    UUID appointmentId;
    String patientName;
    Integer rating;
    String comment;
    LocalDateTime createdAt;
}