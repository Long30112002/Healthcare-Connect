package com.hoanglong.healthcare_connect_backend.application.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)

public class ChangePasswordRequest {
    @NotBlank(message = "PASSWORD_REQUIRED")
    String oldPassword;

    @NotBlank(message = "PASSWORD_REQUIRED")
    @Size(min = 8, message = "PASSWORD_INVALID")
    String newPassword;
}