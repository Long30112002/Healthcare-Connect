package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.statistics.manager.TodayAppointmentResponse;
import com.hoanglong.healthcare_connect_backend.application.service.AppointmentService;
import com.hoanglong.healthcare_connect_backend.application.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;
@RestController
@RequestMapping("/api/manager/appointments")
@RequiredArgsConstructor
@Slf4j
public class ManagerAppointmentController {

    private final AppointmentService appointmentService;
    private final CurrentUserService currentUserService;

    @GetMapping("/today")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<List<TodayAppointmentResponse>> getTodayAppointments() {
        log.info("API: Lấy danh sách lịch hẹn hôm nay cho Manager");

        UUID hospitalId = currentUserService.getCurrentHospitalId();
        List<TodayAppointmentResponse> appointments = appointmentService.getTodayAppointmentsByHospital(hospitalId);

        return ApiResponse.<List<TodayAppointmentResponse>>builder()
                .status("success")
                .code(200)
                .data(appointments)
                .build();
    }

}