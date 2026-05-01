package com.hoanglong.healthcare_connect_backend.application.dto.user;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)

public class UpdateProfileRequest {
    @NotBlank(message = "NAME_INVALID")
    String fullName;

    @NotBlank(message = "PHONE_INVALID")
    String phone;
}
