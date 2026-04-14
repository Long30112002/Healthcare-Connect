package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.ScheduleRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.ScheduleResponse;
import com.hoanglong.healthcare_connect_backend.application.usecase.CreateScheduleUseCase;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
public class DoctorScheduleController {

    private final CreateScheduleUseCase createScheduleUseCase;

    @PostMapping("/schedules")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<ScheduleResponse> create(@RequestBody @Valid ScheduleRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();

        return ApiResponse.<ScheduleResponse>builder()
                .status("success")
                .code(200)
                .message("Tạo lịch khám thành công!")
                .data(createScheduleUseCase.execute(userId, request))
                .build();
    }



}