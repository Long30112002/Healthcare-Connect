package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.statistics.manager.MonthlyRevenueResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.statistics.manager.TopDoctorResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.statistics.manager.TopMedicineResponse;
import com.hoanglong.healthcare_connect_backend.application.service.AdminStatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/statistics")
@RequiredArgsConstructor
@Slf4j
public class AdminStatisticsController {

    private final AdminStatisticsService adminStatisticsService;

    @GetMapping("/top-doctors")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<TopDoctorResponse>> getTopDoctors(
            @RequestParam(defaultValue = "5") int limit) {
        log.info("API ADMIN: Lấy top {} bác sĩ toàn hệ thống", limit);
        List<TopDoctorResponse> doctors = adminStatisticsService.getTopDoctors(limit);
        return ApiResponse.<List<TopDoctorResponse>>builder()
                .status("success")
                .code(200)
                .data(doctors)
                .build();
    }

    @GetMapping("/top-medicines")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<TopMedicineResponse>> getTopMedicines(
            @RequestParam(defaultValue = "5") int limit) {
        log.info("API ADMIN: Lấy top {} thuốc toàn hệ thống", limit);
        List<TopMedicineResponse> medicines = adminStatisticsService.getTopMedicines(limit);
        return ApiResponse.<List<TopMedicineResponse>>builder()
                .status("success")
                .code(200)
                .data(medicines)
                .build();
    }

    @GetMapping("/revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<MonthlyRevenueResponse>> getMonthlyRevenue() {
        log.info("API ADMIN: Lấy doanh thu theo tháng toàn hệ thống");
        List<MonthlyRevenueResponse> revenues = adminStatisticsService.getMonthlyRevenue();
        return ApiResponse.<List<MonthlyRevenueResponse>>builder()
                .status("success")
                .code(200)
                .data(revenues)
                .build();
    }
}