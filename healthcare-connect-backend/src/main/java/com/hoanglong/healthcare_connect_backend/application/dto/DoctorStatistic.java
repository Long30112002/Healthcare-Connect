package com.hoanglong.healthcare_connect_backend.application.dto;

import lombok.Builder;
import lombok.Data;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorStatistic {
    UUID doctorId;
    String doctorName;
    long totalPatients;
    long checkedInPatients;
}