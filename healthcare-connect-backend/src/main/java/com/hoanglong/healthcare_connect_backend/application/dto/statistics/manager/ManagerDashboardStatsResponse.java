package com.hoanglong.healthcare_connect_backend.application.dto.statistics.manager;

import lombok.Builder;
import lombok.Data;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ManagerDashboardStatsResponse {
    long totalDoctors;
    double totalDoctorsChange;      // % thay đổi so với tháng trước

    long totalReceptionists;
    double totalReceptionistsChange;

    long totalAppointmentsToday;
    double totalAppointmentsTodayChange;  // % so với hôm qua

    long revenueThisMonth;
    double revenueThisMonthChange;        // % so với tháng trước
}