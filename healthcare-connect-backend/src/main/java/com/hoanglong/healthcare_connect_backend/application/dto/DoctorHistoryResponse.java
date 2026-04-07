package com.hoanglong.healthcare_connect_backend.application.dto;

import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class DoctorHistoryResponse {
    Long id;
    UUID doctorId;
    String actorName;
    String actorRole;
    String action;
    String oldStatus;
    String newStatus;
    String rejectionReason;
    String rejectionNote;
    String note;
    LocalDateTime createdAt;
}