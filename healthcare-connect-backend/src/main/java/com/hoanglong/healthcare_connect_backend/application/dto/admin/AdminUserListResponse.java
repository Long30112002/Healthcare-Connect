package com.hoanglong.healthcare_connect_backend.application.dto.admin;

import com.hoanglong.healthcare_connect_backend.core.constant.UserRole;
import lombok.Builder;
import lombok.Data;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminUserListResponse {
    UUID id;
    String fullName;
    String email;
    String phone;
    UserRole role;
    Boolean enabled;
    LocalDateTime createdAt;
    String lockReason;
}