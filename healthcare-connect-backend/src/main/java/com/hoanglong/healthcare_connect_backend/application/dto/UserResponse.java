package com.hoanglong.healthcare_connect_backend.application.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hoanglong.healthcare_connect_backend.core.entity.UserRole;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)

public class UserResponse {
    UUID id;
    String fullName;
    String email;
    UserRole role;
    String phone;
    LocalDateTime createdAt;
    PendingInvitationDTO pendingInvitation;

    @Data
    @Builder
    public static class PendingInvitationDTO {
        UUID hospitalId;
        String hospitalName;
        String token;
    }
}