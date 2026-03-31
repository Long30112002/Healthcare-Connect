package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.RejectDoctorRequest;
import com.hoanglong.healthcare_connect_backend.application.usecase.ApproveDoctorUseCase;
import com.hoanglong.healthcare_connect_backend.application.usecase.RejectDoctorUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/manager/doctors")
@RequiredArgsConstructor
public class ManagerHosController
{
    private final ApproveDoctorUseCase approveDoctorUseCase;
    private final RejectDoctorUseCase rejectDoctorUseCase;

    @PatchMapping("/{doctorId}/approve")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<String> approve(@PathVariable UUID doctorId) {
        approveDoctorUseCase.execute(doctorId);
        return ApiResponse.<String>builder().data("Phê duyệt hồ sơ thành công.").build();
    }

    @PostMapping("/{doctorId}/reject")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<Void> reject(@PathVariable UUID doctorId, @RequestBody @Valid RejectDoctorRequest request) {
        rejectDoctorUseCase.execute(doctorId, request);
        return ApiResponse.<Void>builder()
                .message("Đã từ chối hồ sơ bác sĩ thành công.")
                .build();
    }
}
