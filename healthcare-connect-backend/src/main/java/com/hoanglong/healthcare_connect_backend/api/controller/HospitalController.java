package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.HospitalRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.HospitalResponse;
import com.hoanglong.healthcare_connect_backend.application.service.HospitalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/hospitals")
@RequiredArgsConstructor
public class HospitalController {
    private final HospitalService hospitalService;

    @PostMapping
    public ApiResponse<HospitalResponse> create(@RequestBody @Valid HospitalRequest request) {
        return ApiResponse.<HospitalResponse>builder()
                .data(hospitalService.createHospital(request))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<HospitalResponse> update(@PathVariable UUID id, @RequestBody @Valid HospitalRequest request) {
        return ApiResponse.<HospitalResponse>builder()
                .data(hospitalService.updateHospital(id, request))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<HospitalResponse> getById(@PathVariable UUID id) {
        return ApiResponse.<HospitalResponse>builder()
                .data(hospitalService.getHospitalById(id))
                .build();
    }

    // Thêm các API khác như getAll, update...
}