package com.hoanglong.healthcare_connect_backend.application.dto.review;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class DoctorReviewResponse {
    private UUID id;
    private UUID appointmentId;
    private String patientName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}