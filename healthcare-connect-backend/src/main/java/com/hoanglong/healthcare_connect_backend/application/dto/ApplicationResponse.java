package com.hoanglong.healthcare_connect_backend.application.dto;

import com.hoanglong.healthcare_connect_backend.core.constant.RejectionReason;
import com.hoanglong.healthcare_connect_backend.core.entity.UserRole;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ApplicationResponse {
    UUID id;
    UserRole type;
    String hospitalName;
    UUID hospitalId;
    String status;
    RejectionReason rejectionReason;
    String rejectionNote;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}