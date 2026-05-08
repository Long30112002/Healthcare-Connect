package com.hoanglong.healthcare_connect_backend.application.dto.statistics.manager;
import com.hoanglong.healthcare_connect_backend.core.constant.AppointmentStatus;
import lombok.Builder;
import lombok.Data;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TodayAppointmentResponse {
    UUID id;
    String patientName;
    String patientPhone;
    String doctorName;
    UUID doctorId;
    LocalTime startTime;
    LocalTime endTime;
    String symptoms;
    AppointmentStatus status;
    boolean isPaid;
    double price;
    String roomNumber;
}