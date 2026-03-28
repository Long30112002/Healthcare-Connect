package com.hoanglong.healthcare_connect_backend.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class DoctorProfileRequest {
    @NotNull(message = "DEPARTMENT_REQUIRED")
    private UUID departmentId;

    @NotNull(message = "SPECIALTY_REQUIRED")
    private UUID specialtyId;

    @NotBlank(message = "DEGREE_REQUIRED")
    private String degree;

    private String experience;

    @NotNull(message = "FEE_REQUIRED")
    private BigDecimal consultationFee;
}