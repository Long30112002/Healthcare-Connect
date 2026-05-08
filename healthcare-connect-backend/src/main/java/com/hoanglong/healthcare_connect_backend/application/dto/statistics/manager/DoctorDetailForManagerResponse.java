package com.hoanglong.healthcare_connect_backend.application.dto.statistics.manager;

import com.hoanglong.healthcare_connect_backend.application.dto.doctor.DoctorHistoryResponse;
import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
import lombok.Builder;
import lombok.Data;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorDetailForManagerResponse {
    // Personal info
    UUID id;
    String doctorCode;
    String fullName;
    String email;
    String phone;
    DoctorStatus status;
    LocalDateTime createdAt;

    // Professional info
    String degree;
    Integer experienceYears;
    String biography;
    BigDecimal consultationFee;
    String specialtyName;
    String departmentName;

    // Hospital info
    UUID hospitalId;
    String hospitalName;
    String hospitalAddress;

    // CV
    String cvUrl;

    // Approval history
    List<DoctorHistoryResponse> history;
}