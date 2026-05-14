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

public class ReviewResponse {
    UUID id;
    UUID appointmentId;
    UUID patientId;
    String patientName;      // Nếu không ẩn danh
    UUID doctorId;
    String doctorName;
    Integer rating;
    String comment;
    boolean isAnonymous;
    boolean isEdited;
    LocalDateTime editedAt;
    LocalDateTime createdAt;
    boolean canEdit;          // Có thể sửa trong 7 ngày không?
}