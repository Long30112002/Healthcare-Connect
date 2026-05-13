package com.hoanglong.healthcare_connect_backend.application.dto.system_config;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)

public class UpdateConfigRequest {
    @NotBlank(message = "CONFIG_VALUE_REQUIRED")
    String configValue;

    String description;

    Boolean isActive; // optional
}