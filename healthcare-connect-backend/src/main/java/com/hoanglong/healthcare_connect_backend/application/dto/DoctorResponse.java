package com.hoanglong.healthcare_connect_backend.application.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder

public class DoctorResponse {
    private UUID id;
    private String doctorCode;
    private String fullName;
    private String email;
    private String phone;
    private String degree;
    private String experience;
    private BigDecimal consultationFee;
    private String status;
    private String specialtyName;
    private String departmentName;
}