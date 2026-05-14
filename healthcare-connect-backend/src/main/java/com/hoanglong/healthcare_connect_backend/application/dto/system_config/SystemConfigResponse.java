package com.hoanglong.healthcare_connect_backend.application.dto.system_config;

import lombok.AccessLevel;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)

public class SystemConfigResponse {
    UUID id;
    String configKey;
    String configValue;
    String configType;
    String groupName;
    String displayName;
    String description;
    Integer displayOrder;
    Boolean isActive;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    UUID updatedBy;
    String updatedByName;
}