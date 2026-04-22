package com.hoanglong.healthcare_connect_backend.application.dto.statistics;

import lombok.Builder;
import lombok.Data;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HourlyStatistic {
    int hour;
    long total;
    long checkedIn;
    long waiting;
}