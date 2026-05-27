package com.hoanglong.healthcare_connect_backend.application.dto.statistics.admin;

import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
import lombok.Builder;
import lombok.Data;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminDoctorListResponse {
    UUID id;
    String doctorCode;
    String fullName;
    String email;
    String phone;
    String specialtyName;
    String departmentName;
    String hospitalName;
    UUID hospitalId;
    Integer experienceYears;
    BigDecimal consultationFee;
    DoctorStatus status;
    LocalDateTime createdAt;
}