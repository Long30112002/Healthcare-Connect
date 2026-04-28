package com.hoanglong.healthcare_connect_backend.application.dto.doctor;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)

public class DoctorResponse {
    UUID id;
    String doctorCode;
    String fullName;
    String email;
    String phone;
    String degree;
    Integer experienceYears;
    String biography;
    String cvUrl;
    BigDecimal consultationFee;
    String status;
    String specialtyName;
    String departmentName;
    String hospitalName;
    UUID hospitalId;
    String hospitalAddress;
}