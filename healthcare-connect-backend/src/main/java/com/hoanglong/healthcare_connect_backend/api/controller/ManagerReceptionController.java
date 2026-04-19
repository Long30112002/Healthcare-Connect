package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.RejectReceptionistRequest;
import com.hoanglong.healthcare_connect_backend.application.usecase.ApproveReceptionistUseCase;
import com.hoanglong.healthcare_connect_backend.application.usecase.RejectReceptionistUseCase;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/manager/receptionist")
@RequiredArgsConstructor
public class ManagerReceptionController
{
    private final ApproveReceptionistUseCase approveReceptionistUseCase;
    private final RejectReceptionistUseCase rejectReceptionistUseCase;

    @PatchMapping("/{receptionistId}/approve")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<Void> approve(
            @PathVariable UUID receptionistId,
            HttpServletRequest httpRequest) {

        approveReceptionistUseCase.execute(receptionistId, httpRequest);

        return ApiResponse.<Void>builder()
                .status("success")
                .code(200)
                .message("Tiếp nhận lễ tân thành công!")
                .build();
    }

    @PostMapping("/{receptionistId}/reject")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<Void> reject(
            @PathVariable UUID receptionistId,
            @RequestBody @Valid RejectReceptionistRequest request,
            HttpServletRequest httpRequest) {

        rejectReceptionistUseCase.execute(receptionistId, request, httpRequest);

        return ApiResponse.<Void>builder()
                .status("success")
                .code(200)
                .message("Đã từ chối hồ sơ lễ tân thành công!")
                .build();
    }
}
