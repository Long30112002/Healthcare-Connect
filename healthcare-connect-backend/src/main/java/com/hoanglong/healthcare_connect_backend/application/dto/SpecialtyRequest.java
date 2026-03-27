package com.hoanglong.healthcare_connect_backend.application.dto;

import com.hoanglong.healthcare_connect_backend.core.constant.MedicalCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SpecialtyRequest {
    @NotBlank(message = "NAME_INVALID")
    String name;
    String description;
    @NotNull(message = "CATEGORY_INVALID")
    private MedicalCategory category;
    @NotNull(message = "DEPARTMENT_ID_REQUIRED")
    UUID departmentId; // Chỉ cần gửi cái ID của Khoa
}