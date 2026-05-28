package com.hoanglong.healthcare_connect_backend.application.dto.admin;

import com.hoanglong.healthcare_connect_backend.core.constant.HospitalStatus;
import lombok.Builder;
import lombok.Data;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminHospitalListResponse {
    UUID id;
    String name;
    String address;
    String hotline;
    String email;
    String managerName;
    String managerEmail;
    HospitalStatus status;
    LocalDateTime createdAt;
}