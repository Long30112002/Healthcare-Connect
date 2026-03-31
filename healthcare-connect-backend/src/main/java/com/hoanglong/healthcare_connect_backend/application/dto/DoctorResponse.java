package com.hoanglong.healthcare_connect_backend.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorResponse {
    private UUID id;
    private String doctorCode;
    private String fullName;
    private String email;
    private String phone;
    private String degree;
    private Integer experienceYears;
    private String biography;
    private String cvUrl;
    private BigDecimal consultationFee;
    private String status;
    private String specialtyName;
    private String departmentName;
    private String hospitalName;
}