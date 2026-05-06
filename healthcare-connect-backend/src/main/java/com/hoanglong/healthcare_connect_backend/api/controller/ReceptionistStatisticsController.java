package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.statistics.receptionist.*;
import com.hoanglong.healthcare_connect_backend.application.service.CurrentUserService;
import com.hoanglong.healthcare_connect_backend.application.service.ReceptionistStatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/receptionist/statistics")
@RequiredArgsConstructor
@Slf4j
public class ReceptionistStatisticsController {

    private final ReceptionistStatisticsService receptionistStatisticsService;
    private final CurrentUserService currentUserService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('RECEPTIONIST')")
    public ApiResponse<DashboardStatistics> getDashboardStatistics(
            @RequestParam(defaultValue = "today") String filter
    ) {
        UUID hospitalId = currentUserService.getCurrentReceptionistHospitalId();
        DashboardStatistics response = receptionistStatisticsService.getDashboardStatistics(filter, hospitalId);
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
        UUID hospitalId = currentUserService.getCurrentReceptionistHospitalId();
        StatisticsResponse response = receptionistStatisticsService.getSummaryStatistics(startDate, endDate, hospitalId);
        return ApiResponse.<StatisticsResponse>builder()
                .status("success")
                .code(200)
                .data(response)
                .build();
    }

    // 2. Thống kê theo kỳ
    @GetMapping("/by-period")
    @PreAuthorize("hasRole('RECEPTIONIST')")
    public ApiResponse<StatisticsResponse> getStatisticsByPeriod(
            @RequestParam(defaultValue = "month") String period
    ) {
        UUID hospitalId = currentUserService.getCurrentReceptionistHospitalId();
        StatisticsResponse response = receptionistStatisticsService.getStatisticsByPeriod(period, hospitalId);
        return ApiResponse.<StatisticsResponse>builder()
                .status("success")
                .code(200)
                .data(response)
                .build();
    }

    // 3. Thống kê theo giờ
    @GetMapping("/hourly")
    @PreAuthorize("hasRole('RECEPTIONIST')")
    public ApiResponse<List<HourlyStatistic>> getHourlyStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        UUID hospitalId = currentUserService.getCurrentReceptionistHospitalId();
        List<HourlyStatistic> response = receptionistStatisticsService.getHourlyStatistics(startDate, endDate, hospitalId);
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
        UUID hospitalId = currentUserService.getCurrentReceptionistHospitalId();
        List<DoctorStatistic> response = receptionistStatisticsService.getDoctorStatistics(startDate, endDate, hospitalId);
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
        UUID hospitalId = currentUserService.getCurrentReceptionistHospitalId();
        List<DailyStatistic> response = receptionistStatisticsService.getDailyStatistics(startDate, endDate, hospitalId);
        return ApiResponse.<List<DailyStatistic>>builder()
                .status("success")
                .code(200)
                .data(response)
                .build();
    }
}