package com.hoanglong.healthcare_connect_backend.application.dto.statistics.manager;

import lombok.Builder;
import lombok.Data;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TopMedicineResponse {
    String medicineName;
    long prescriptionCount;
}