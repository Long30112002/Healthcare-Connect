package com.hoanglong.healthcare_connect_backend.application.dto;

import com.hoanglong.healthcare_connect_backend.core.constant.ReceptionistStatus;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReceptionistListResponse {
    UUID id;
    String receptionistCode;
    String fullName;
    String email;
    String phone;
    String hospitalName;
    ReceptionistStatus status;
    LocalDateTime createdAt;
}