package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.DoctorResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.RejectDoctorRequest;
import com.hoanglong.healthcare_connect_backend.application.service.DoctorService;
import com.hoanglong.healthcare_connect_backend.application.usecase.ApproveDoctorUseCase;
import com.hoanglong.healthcare_connect_backend.application.usecase.RejectDoctorUseCase;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/manager/doctors")
@RequiredArgsConstructor
public class ManagerDoctorController
{
    private final ApproveDoctorUseCase approveDoctorUseCase;
    private final RejectDoctorUseCase rejectDoctorUseCase;
    private final DoctorService doctorService;

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<DoctorResponse> getDoctorForManager(@PathVariable UUID id) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        return ApiResponse.<DoctorResponse>builder()
                .data(doctorService.getDoctorForManager(id, currentUserId))
                .build();
    }

    @GetMapping("/inHospital")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<List<DoctorResponse>> getAllDoctorsInMyHospital() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        return ApiResponse.<List<DoctorResponse>>builder()
                .data(doctorService.getAllDoctorsByManager(currentUserId))
                .build();
    }

    @GetMapping("/pending-approval")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<List<DoctorResponse>> getVerifiedDoctorsForManager() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        return ApiResponse.<List<DoctorResponse>>builder()
                .data(doctorService.getVerifiedDoctorsByManager(currentUserId))
                .build();
    }

    @PatchMapping("/{doctorId}/approve")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<String> approve(@PathVariable UUID doctorId, HttpServletRequest httpRequest) {
        approveDoctorUseCase.execute(doctorId, httpRequest);
        return ApiResponse.<String>builder().data("Phê duyệt hồ sơ thành công.").build();
    }

    @PostMapping("/{doctorId}/reject")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<Void> reject(@PathVariable UUID doctorId, @RequestBody @Valid RejectDoctorRequest request, HttpServletRequest httpRequest) {
        rejectDoctorUseCase.execute(doctorId, request, httpRequest);
        return ApiResponse.<Void>builder()
                .message("Đã từ chối hồ sơ bác sĩ thành công.")
                .build();
    }

}
