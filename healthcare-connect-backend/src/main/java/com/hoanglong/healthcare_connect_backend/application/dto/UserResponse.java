package com.hoanglong.healthcare_connect_backend.application.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hoanglong.healthcare_connect_backend.core.entity.UserRole;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private UserRole role;
    private String phone;
    private LocalDateTime createdAt;
}