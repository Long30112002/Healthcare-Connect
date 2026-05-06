package com.hoanglong.healthcare_connect_backend.application.dto.statistics.doctor;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)

public class DoctorTrendDTO {

    Integer month;

    Integer year;

    Long count;
}   