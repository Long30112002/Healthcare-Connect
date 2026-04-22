package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.invitation.AcceptInvitationRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.hospital.HospitalRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.hospital.HospitalResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.user.UserResponse;
import com.hoanglong.healthcare_connect_backend.application.service.HospitalService;
import com.hoanglong.healthcare_connect_backend.application.usecase.AcceptHospitalInvitationUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/hospitals")
@RequiredArgsConstructor
public class HospitalController {
    private final HospitalService hospitalService;
    private final AcceptHospitalInvitationUseCase acceptHospitalInvitationUseCase;

    @PostMapping
    public ApiResponse<HospitalResponse> create(@RequestBody @Valid HospitalRequest request) {
        return ApiResponse.<HospitalResponse>builder()
                .data(hospitalService.createHospital(request))
                .build();
    }

    @GetMapping
    @PreAuthorize("permitAll()")
    public ApiResponse<List<HospitalResponse>> getAllHospitals() {
        return ApiResponse.<List<HospitalResponse>>builder()
                .status("success")
                .code(200)
                .data(hospitalService.getAllHospitals())
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<HospitalResponse> update(@PathVariable UUID id, @RequestBody @Valid HospitalRequest request) {
        return ApiResponse.<HospitalResponse>builder()
                .data(hospitalService.updateHospital(id, request))
                .build();
    }

    @PostMapping("/accept-invitation")
    public ApiResponse<UserResponse> acceptInvitation(@RequestBody AcceptInvitationRequest request) {
        return acceptHospitalInvitationUseCase.execute(request);
    }

//    @PreAuthorize("hasRole('ADMIN') or (hasRole('HOSPITAL_MANAGER') and @securityService.isManagerOfHospital(#id))")
    @GetMapping("/{id}")
    public ApiResponse<HospitalResponse> getById(@PathVariable UUID id) {
        return ApiResponse.<HospitalResponse>builder()
                .data(hospitalService.getHospitalById(id))
                .build();
    }

    // Thêm các API khác như getAll, update...
}