package com.hoanglong.healthcare_connect_backend.application.dto;

import lombok.Builder;
import lombok.Data;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorDetailResponse {
    UUID id;
    String fullName;
    String specialtyName;
    String hospitalName;
    String address;
    Integer experienceYears;
    String degree;
    String biography;
    BigDecimal consultationFee;
    Double rating;
    String avatar;
    List<ScheduleResponse> schedules;
}