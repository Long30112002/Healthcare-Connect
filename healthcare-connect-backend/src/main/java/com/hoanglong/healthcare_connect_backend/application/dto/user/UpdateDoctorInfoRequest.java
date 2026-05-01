package com.hoanglong.healthcare_connect_backend.application.dto.user;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)

public class UpdateDoctorInfoRequest {
    String degree;
    Integer experienceYears;
    String biography;
    BigDecimal consultationFee;
}
