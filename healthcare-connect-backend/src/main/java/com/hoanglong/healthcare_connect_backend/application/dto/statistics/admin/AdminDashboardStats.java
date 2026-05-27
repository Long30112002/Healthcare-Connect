package com.hoanglong.healthcare_connect_backend.application.dto.statistics.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminDashboardStats {
    long totalUsers;
    double totalUsersChange;
    long totalDoctors;
    double totalDoctorsChange;
    long totalHospitals;
    double totalHospitalsChange;
    long totalBookings;
    double totalBookingsChange;
    long todayBookings;
    long weekBookings;
    long monthBookings;
    double paymentRate;
    double cancelRate;
    double noShowRate;
}