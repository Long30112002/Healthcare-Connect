package com.hoanglong.healthcare_connect_backend.application.dto.doctor;

import com.hoanglong.healthcare_connect_backend.application.dto.schedule.ScheduleResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PublicDoctorDetailResponse {
    UUID id;
    String fullName;
    String specialtyName;
    String departmentName;
    String hospitalName;
    String hospitalAddress;
    String hospitalPhone;
    String hospitalEmail;
    Integer experienceYears;
    String degree;
    String biography;
    BigDecimal consultationFee;
    Double averageRating;
    Long totalReviews;
    String avatar;
    List<ScheduleResponse> schedules;
}