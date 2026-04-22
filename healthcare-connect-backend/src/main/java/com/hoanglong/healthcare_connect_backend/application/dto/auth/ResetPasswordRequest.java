package com.hoanglong.healthcare_connect_backend.application.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ResetPasswordRequest {
    @NotBlank
    String code;
    @NotBlank
    @Size(min = 8, message = "Mật khẩu phải ít nhất 8 ký tự")
    String newPassword;
}