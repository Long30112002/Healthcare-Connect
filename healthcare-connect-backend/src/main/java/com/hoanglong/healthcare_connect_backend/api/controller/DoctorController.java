package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.DoctorProfileRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.DoctorResponse;
import com.hoanglong.healthcare_connect_backend.application.usecase.RegisterDoctorProfileUseCase;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {
    private final RegisterDoctorProfileUseCase registerDoctorProfileUseCase;

    @PostMapping("/apply")
    public ApiResponse<DoctorResponse> apply(@RequestBody @Valid DoctorProfileRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.<DoctorResponse>builder()
                .status("success")
                .code(201)
                .message("Gửi hồ sơ đăng ký bác sĩ thành công! Vui lòng chờ Admin phê duyệt.")
                .data(registerDoctorProfileUseCase.execute(userId, request))
                .build();
    }
}