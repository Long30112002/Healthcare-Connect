package com.hoanglong.healthcare_connect_backend.application.dto.statistics.admin;

import lombok.Builder;
import lombok.Data;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserTrendDTO {
    int month;
    int year;
    long count;
}