package com.hoanglong.healthcare_connect_backend.application.dto.auth;

import com.hoanglong.healthcare_connect_backend.core.entity.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserRegistrationRequest {
    @NotBlank(message = "NAME_INVALID")
    String fullName;

    @Email(message = "EMAIL_INVALID")
    @NotBlank(message = "EMAIL_INVALID")
    String email;

    @Size(min = 8, message = "PASSWORD_INVALID")
    String password;

    UserRole role;

    @NotBlank(message = "PHONE_INVALID")
    String phone;
}