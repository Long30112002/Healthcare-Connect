package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.DoctorProfileRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.DoctorResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.HospitalResponse;
import com.hoanglong.healthcare_connect_backend.application.service.DoctorService;
import com.hoanglong.healthcare_connect_backend.application.usecase.RegisterDoctorProfileUseCase;
import com.hoanglong.healthcare_connect_backend.core.entity.Doctor;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {
    private final RegisterDoctorProfileUseCase registerDoctorProfileUseCase;
    private final DoctorService doctorService;

    @PostMapping(value = "/apply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<DoctorResponse> apply(@ModelAttribute @Valid DoctorProfileRequest request, HttpServletRequest httpRequest) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.<DoctorResponse>builder()
                .status("success")
                .message("Hồ sơ đã được gửi kèm CV!")
                .data(registerDoctorProfileUseCase.execute(userId, request, httpRequest))
                .build();
    }

    @GetMapping("/public/{id}")
    public ApiResponse<DoctorResponse> getPublicDoctorById(@PathVariable UUID id) {
        return ApiResponse.<DoctorResponse>builder()
                .data(doctorService.getPublicDoctorById(id))
                .build();
    }

    @GetMapping("/me")
    public ApiResponse<DoctorResponse> getMyDoctorProfile() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        Doctor doctor = doctorService.getDoctorEntityByUserId(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));
        return ApiResponse.<DoctorResponse>builder()
                .data(doctorService.getDoctorProfileForSelf(doctor.getId(), currentUserId))
                .build();
    }
}