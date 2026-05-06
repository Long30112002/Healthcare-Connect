package com.hoanglong.healthcare_connect_backend.application.dto.hospital;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WorkingHoursRequest {

    @NotNull(message = "DAY_OF_WEEK_REQUIRED")
    @Min(value = 2, message = "DAY_OF_WEEK_INVALID")
    Integer dayOfWeek;  // 2=Thứ 3, 3=Thứ 4, 4=Thứ 5, 5=Thứ 6, 6=Thứ 7, 7=Chủ nhật, 8=Thứ 2

    @NotNull(message = "START_TIME_REQUIRED")
    LocalTime startTime;

    @NotNull(message = "END_TIME_REQUIRED")
    LocalTime endTime;

    LocalTime lunchStart;  // Có thể null (nếu không nghỉ trưa)

    LocalTime lunchEnd;    // Có thể null (nếu không nghỉ trưa)

    @Min(value = 5, message = "MIN_SLOT_TOO_SMALL")
    Integer minSlotMinutes;

    @Min(value = 5, message = "MAX_SLOT_TOO_SMALL")
    Integer maxSlotMinutes;

    Boolean isActive;
}