package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.statistics.manager.*;
import com.hoanglong.healthcare_connect_backend.application.service.CurrentUserService;
import com.hoanglong.healthcare_connect_backend.application.service.ManagerStatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/manager/statistics")
@RequiredArgsConstructor
@Slf4j
public class ManagerStatisticsController {

    private final ManagerStatisticsService statisticsService;
    private final CurrentUserService currentUserService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<ManagerDashboardStatsResponse> getDashboardStats() {
        log.info("API: Lấy thống kê dashboard cho Manager");

        UUID hospitalId = currentUserService.getCurrentHospitalId();
        ManagerDashboardStatsResponse stats = statisticsService.getManagerDashboardStats(hospitalId);

        return ApiResponse.<ManagerDashboardStatsResponse>builder()
                .status("success")
                .code(200)
                .data(stats)
                .build();
    }

    @GetMapping("/weekly")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<List<WeeklyStatResponse>> getWeeklyStatistics() {
        log.info("API: Lấy thống kê theo tuần cho Manager");

        UUID hospitalId = currentUserService.getCurrentHospitalId();
        List<WeeklyStatResponse> weeklyStats = statisticsService.getWeeklyStatistics(hospitalId);

        return ApiResponse.<List<WeeklyStatResponse>>builder()
                .status("success")
                .code(200)
                .data(weeklyStats)
                .build();
    }

    @GetMapping("/revenue")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<List<MonthlyRevenueResponse>> getMonthlyRevenue() {
        log.info("API: Lấy doanh thu theo tháng cho Manager");

        UUID hospitalId = currentUserService.getCurrentHospitalId();
        List<MonthlyRevenueResponse> revenues = statisticsService.getMonthlyRevenue(hospitalId);

        return ApiResponse.<List<MonthlyRevenueResponse>>builder()
                .status("success")
                .code(200)
                .data(revenues)
                .build();
    }


    @GetMapping("/top-doctors")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<List<TopDoctorResponse>> getTopDoctors(
            @RequestParam(defaultValue = "5") int limit
    ) {
        log.info("API: Lấy top {} bác sĩ cho Manager", limit);

        UUID hospitalId = currentUserService.getCurrentHospitalId();
        List<TopDoctorResponse> topDoctors = statisticsService.getTopDoctors(hospitalId, limit);

        return ApiResponse.<List<TopDoctorResponse>>builder()
                .status("success")
                .code(200)
                .data(topDoctors)
                .build();
    }

    @GetMapping("/departments")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<List<DepartmentStatResponse>> getDepartmentStatistics() {
        log.info("API: Lấy thống kê theo khoa cho Manager");

        UUID hospitalId = currentUserService.getCurrentHospitalId();
        List<DepartmentStatResponse> stats = statisticsService.getDepartmentStatistics(hospitalId);

        return ApiResponse.<List<DepartmentStatResponse>>builder()
                .status("success")
                .code(200)
                .data(stats)
                .build();
    }

    @GetMapping("/top-medicines")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<List<TopMedicineResponse>> getTopMedicines(
            @RequestParam(defaultValue = "5") int limit
    ) {
        log.info("API: Lấy top {} thuốc được kê nhiều nhất", limit);

        UUID hospitalId = currentUserService.getCurrentHospitalId();
        List<TopMedicineResponse> topMedicines = statisticsService.getTopMedicines(hospitalId, limit);

        return ApiResponse.<List<TopMedicineResponse>>builder()
                .status("success")
                .code(200)
                .data(topMedicines)
                .build();
    }

}