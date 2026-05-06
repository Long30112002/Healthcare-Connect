package com.hoanglong.healthcare_connect_backend.application.dto.statistics.receptionist;

import lombok.Builder;
import lombok.Data;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import java.time.LocalDate;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DailyStatistic {
    LocalDate date;
    long total;
    long checkedIn;
    long waiting;
}