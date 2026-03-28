package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.DoctorResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.RejectDoctorRequest;
import com.hoanglong.healthcare_connect_backend.application.mapper.DoctorMapper;
import com.hoanglong.healthcare_connect_backend.application.usecase.ApproveDoctorUseCase;
import com.hoanglong.healthcare_connect_backend.application.usecase.RejectDoctorUseCase;
import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
import com.hoanglong.healthcare_connect_backend.core.repository.IDoctorRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/doctors")
@RequiredArgsConstructor
public class AdminController {
    private final ApproveDoctorUseCase approveDoctorUseCase;
    private final RejectDoctorUseCase rejectDoctorUseCase;
    private final IDoctorRepository doctorRepository;
    private final DoctorMapper doctorMapper;

    @PatchMapping("/{doctorId}/approve")
    @PreAuthorize("hasRole('ADMIN')") // Chỉ tài khoản ADMIN mới có quyền duyệt
    public ApiResponse<String> approve(@PathVariable UUID doctorId) {
        approveDoctorUseCase.execute(doctorId);

        return ApiResponse.<String>builder()
                .data("Phê duyệt bác sĩ thành công. User đã được cấp quyền DOCTOR.")
                .build();
    }

    @PostMapping("/{doctorId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> reject(@PathVariable UUID doctorId, @RequestBody @Valid RejectDoctorRequest request) {
        rejectDoctorUseCase.execute(doctorId, request);
        return ApiResponse.<Void>builder()
                .message("Đã từ chối hồ sơ bác sĩ thành công.")
                .build();
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<DoctorResponse>> getPendingDoctors() {
        var pendingDoctors = doctorRepository.findAllByStatus(DoctorStatus.PENDING);

        return ApiResponse.<List<DoctorResponse>>builder()
                .data(doctorMapper.toDoctorResponseList(pendingDoctors)) // Gọn hơn rất nhiều
                .code(200)
                .build();
    }
}