package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.*;
import com.hoanglong.healthcare_connect_backend.application.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/receptionist/statistics")
@RequiredArgsConstructor
@Slf4j
public class ReceptionistStatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('RECEPTIONIST')")
    public ApiResponse<DashboardStatistics> getDashboardStatistics(
            @RequestParam(defaultValue = "today") String filter
    ) {
        DashboardStatistics response = statisticsService.getDashboardStatistics(filter);
        return ApiResponse.<DashboardStatistics>builder()
                .status("success")
                .code(200)
                .data(response)
                .build();
    }

    // 1. Thống kê tổng hợp
    @GetMapping("/summary")
    @PreAuthorize("hasRole('RECEPTIONIST')")
    public ApiResponse<StatisticsResponse> getSummaryStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        StatisticsResponse response = statisticsService.getSummaryStatistics(startDate, endDate);
        return ApiResponse.<StatisticsResponse>builder()
                .status("success")
                .code(200)
                .data(response)
                .build();
    }

    // 2. Thống kê theo kỳ (today, week, month, quarter, halfyear, year)
    @GetMapping("/by-period")
    @PreAuthorize("hasRole('RECEPTIONIST')")
    public ApiResponse<StatisticsResponse> getStatisticsByPeriod(
            @RequestParam(defaultValue = "month") String period
    ) {
        StatisticsResponse response = statisticsService.getStatisticsByPeriod(period);
        return ApiResponse.<StatisticsResponse>builder()
                .status("success")
                .code(200)
                .data(response)
                .build();
    }

    // 3. Thống kê theo giờ - KHÔNG BẮT BUỘC tham số
    @GetMapping("/hourly")
    @PreAuthorize("hasRole('RECEPTIONIST')")
    public ApiResponse<List<HourlyStatistic>> getHourlyStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        List<HourlyStatistic> response = statisticsService.getHourlyStatistics(startDate, endDate);
        return ApiResponse.<List<HourlyStatistic>>builder()
                .status("success")
                .code(200)
                .data(response)
                .build();
    }

    // 4. Thống kê theo bác sĩ
    @GetMapping("/doctors")
    @PreAuthorize("hasRole('RECEPTIONIST')")
    public ApiResponse<List<DoctorStatistic>> getDoctorStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        List<DoctorStatistic> response = statisticsService.getDoctorStatistics(startDate, endDate);
        return ApiResponse.<List<DoctorStatistic>>builder()
                .status("success")
                .code(200)
                .data(response)
                .build();
    }

    // 5. Thống kê theo ngày - KHÔNG BẮT BUỘC tham số
    @GetMapping("/daily")
    @PreAuthorize("hasRole('RECEPTIONIST')")
    public ApiResponse<List<DailyStatistic>> getDailyStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        List<DailyStatistic> response = statisticsService.getDailyStatistics(startDate, endDate);
        return ApiResponse.<List<DailyStatistic>>builder()
                .status("success")
                .code(200)
                .data(response)
                .build();
    }
}