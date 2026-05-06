package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.statistics.doctor.DoctorStatisticsResponse;
import com.hoanglong.healthcare_connect_backend.application.service.DoctorStatisticsService;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/doctor/statistics")
@RequiredArgsConstructor
@Slf4j
public class DoctorStatisticsController {

    private final DoctorStatisticsService statisticsService;

    @GetMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<DoctorStatisticsResponse> getStatistics(
            @RequestParam(defaultValue = "month") String period
    ) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        log.info("API: Lấy thống kê cho doctor ID: {}, period: {}", currentUserId, period);

        DoctorStatisticsResponse response = statisticsService.getStatistics(currentUserId, period);

        return ApiResponse.<DoctorStatisticsResponse>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Lấy dữ liệu thống kê thành công")
                .data(response)
                .build();
    }
}