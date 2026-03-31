package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.DoctorProfileRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.DoctorResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.HospitalResponse;
import com.hoanglong.healthcare_connect_backend.application.service.DoctorService;
import com.hoanglong.healthcare_connect_backend.application.usecase.RegisterDoctorProfileUseCase;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {
    private final RegisterDoctorProfileUseCase registerDoctorProfileUseCase;
    private final DoctorService doctorService;

    @PostMapping(value = "/apply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<DoctorResponse> apply(@ModelAttribute @Valid DoctorProfileRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.<DoctorResponse>builder()
                .status("success")
                .message("Hồ sơ đã được gửi kèm CV!")
                .data(registerDoctorProfileUseCase.execute(userId, request))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<DoctorResponse> getById(@PathVariable UUID id) {
        return ApiResponse.<DoctorResponse>builder()
                .data(doctorService.getDoctorById(id))
                .build();
    }
}