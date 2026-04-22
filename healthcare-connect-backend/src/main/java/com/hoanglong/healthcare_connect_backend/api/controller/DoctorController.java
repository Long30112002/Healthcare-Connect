package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.appointment.AppointmentResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.schedule.ScheduleRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.schedule.ScheduleResponse;
import com.hoanglong.healthcare_connect_backend.application.service.AppointmentService;
import com.hoanglong.healthcare_connect_backend.application.service.DoctorService;
import com.hoanglong.healthcare_connect_backend.application.service.ReceptionistService;
import com.hoanglong.healthcare_connect_backend.application.usecase.CreateScheduleUseCase;
import com.hoanglong.healthcare_connect_backend.core.entity.Doctor;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
public class DoctorController
{

    private final CreateScheduleUseCase createScheduleUseCase;
    private final DoctorService doctorService;
    private final AppointmentService appointmentService;
    private final ReceptionistService receptionistService;

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

    @GetMapping("/appointments")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<Page<AppointmentResponse>> getMyAppointments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();

        Doctor doctor = doctorService.getDoctorEntityByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));

        Pageable pageable = PageRequest.of(page, size, Sort.by("appointmentDate").ascending());
        Page<AppointmentResponse> appointments = appointmentService.getDoctorAppointments(doctor.getId(), status, pageable);

        return ApiResponse.<Page<AppointmentResponse>>builder()
                .status("success")
                .code(200)
                .message("Lấy danh sách lịch hẹn thành công")
                .data(appointments)
                .build();
    }
    @PatchMapping("/{appointmentId}/check-in")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('RECEPTIONIST')")
    public ApiResponse<String> checkIn(
            @PathVariable UUID appointmentId,
            HttpServletRequest httpRequest) {
        {
            receptionistService.checkIn(appointmentId, httpRequest);
            return ApiResponse.<String>builder()
                    .status("success")
                    .code(200)
                    .message("Check-in thành công!")
                    .data("Bệnh nhân đã được check-in")
                    .build();
        }
    }

    @PatchMapping("/{appointmentId}/complete")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<String> completeExam(@PathVariable UUID appointmentId) {
        appointmentService.completeExam(appointmentId);
        return ApiResponse.<String>builder()
                .status("success")
                .code(200)
                .message("Kết thúc khám thành công!")
                .data("Đã hoàn thành khám bệnh")
                .build();
    }
}