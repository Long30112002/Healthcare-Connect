package com.hoanglong.healthcare_connect_backend.application.dto.review;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ReviewResponse {
    private UUID id;
    private UUID appointmentId;
    private UUID patientId;
    private String patientName;      // Nếu không ẩn danh
    private UUID doctorId;
    private String doctorName;
    private Integer rating;
    private String comment;
    private boolean isAnonymous;
    private boolean isEdited;
    private LocalDateTime editedAt;
    private LocalDateTime createdAt;
    private boolean canEdit;          // Có thể sửa trong 7 ngày không?
}