package com.hoanglong.healthcare_connect_backend.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SpecialtyResponse {
    UUID id;
    String code;
    String name;
    String description;
    DepartmentResponse department; // Trả về cả thông tin Khoa
}