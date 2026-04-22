package com.hoanglong.healthcare_connect_backend.application.dto.receptionist;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReceptionistResponse {
    UUID id;
    String receptionistCode;
    String fullName;
    String email;
    String phone;
    String cvUrl;
    String status;
    String hospitalName;
    String hospitalAddress;
    String rejectionReason;
    String rejectionNote;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}