package com.hoanglong.healthcare_connect_backend.application.dto.statistics.receptionist;

import lombok.Builder;
import lombok.Data;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StatisticsResponse {
    long totalAppointments;
    long checkedIn;
    long waiting;
    long cancelled;
    long noShow;
    double checkInRate;
}