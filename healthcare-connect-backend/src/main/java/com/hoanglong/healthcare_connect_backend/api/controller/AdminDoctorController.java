package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.DoctorHistoryResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.DoctorResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.RejectDoctorRequest;
import com.hoanglong.healthcare_connect_backend.application.mapper.DoctorMapper;
import com.hoanglong.healthcare_connect_backend.application.service.DoctorService;
import com.hoanglong.healthcare_connect_backend.application.usecase.ApproveDoctorUseCase;
import com.hoanglong.healthcare_connect_backend.application.usecase.RejectDoctorUseCase;
import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.DoctorRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/doctors")
@RequiredArgsConstructor
public class AdminDoctorController
{
    private final ApproveDoctorUseCase approveDoctorUseCase;
    private final RejectDoctorUseCase rejectDoctorUseCase;
    private final DoctorRepository doctorRepository;
    private final DoctorService doctorService;
    private final DoctorMapper doctorMapper;



    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<DoctorResponse> getDoctorForAdmin(@PathVariable UUID id) {
        return ApiResponse.<DoctorResponse>builder()
                .data(doctorService.getDoctorForAdmin(id))
                .build();
    }

    @PatchMapping("/{doctorId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> approve(@PathVariable UUID doctorId, HttpServletRequest httpRequest) {
        approveDoctorUseCase.execute(doctorId, httpRequest);
        return ApiResponse.<String>builder()
                .data("Xác thực hồ sơ thành công.")
                .build();
    }

    @PostMapping("/{doctorId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> reject(@PathVariable UUID doctorId, @RequestBody @Valid RejectDoctorRequest request, HttpServletRequest httpRequest) {
        rejectDoctorUseCase.execute(doctorId, request, httpRequest);
        return ApiResponse.<Void>builder()
                .message("Đã từ chối hồ sơ bác sĩ thành công.")
                .build();
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<DoctorResponse>> getPendingDoctors() {
        var pendingDoctors = doctorRepository.findAllByStatus(DoctorStatus.PENDING);

        return ApiResponse.<List<DoctorResponse>>builder()
                .data(doctorMapper.toDoctorResponseList(pendingDoctors))
                .code(200)
                .build();
    }

    @GetMapping("/{doctorId}/history")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<DoctorHistoryResponse>> getDoctorHistory(@PathVariable UUID doctorId) {
        return ApiResponse.<List<DoctorHistoryResponse>>builder()
                .data(doctorService.getDoctorHistory(doctorId))
                .build();
    }
}