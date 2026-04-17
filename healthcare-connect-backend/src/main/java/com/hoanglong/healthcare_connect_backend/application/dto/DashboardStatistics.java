package com.hoanglong.healthcare_connect_backend.application.dto;


import lombok.Builder;
import lombok.Data;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DashboardStatistics {
    long waiting;
    long checkedIn;
    long completed;
    long total;
}