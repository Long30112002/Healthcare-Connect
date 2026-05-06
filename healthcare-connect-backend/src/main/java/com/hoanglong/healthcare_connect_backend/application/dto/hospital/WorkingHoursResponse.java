package com.hoanglong.healthcare_connect_backend.application.dto.hospital;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WorkingHoursResponse {
    UUID id;

    UUID hospitalId;

    String hospitalName;

    Integer dayOfWeek;

    String dayName;  // "Thứ 2", "Thứ 3", ... "Chủ nhật" (tính từ dayOfWeek)

    LocalTime startTime;

    LocalTime endTime;

    LocalTime lunchStart;

    LocalTime lunchEnd;

    Integer minSlotMinutes;

    Integer maxSlotMinutes;

    Boolean isActive;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;
}