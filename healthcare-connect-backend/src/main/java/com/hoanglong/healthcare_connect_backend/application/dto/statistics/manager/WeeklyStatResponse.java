package com.hoanglong.healthcare_connect_backend.application.dto.statistics.manager;
import lombok.Builder;
import lombok.Data;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WeeklyStatResponse {
    String day;        // "Thứ 2", "Thứ 3", ...
    int dayOfWeek;     // 2,3,4,5,6,7,8
    long count;        // Số bệnh nhân
}