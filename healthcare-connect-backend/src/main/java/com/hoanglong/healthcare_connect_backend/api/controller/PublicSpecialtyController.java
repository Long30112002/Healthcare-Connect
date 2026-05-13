package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.hospital.SpecialtyResponse;
import com.hoanglong.healthcare_connect_backend.application.service.SpecialtyService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/specialties")
@RequiredArgsConstructor
public class PublicSpecialtyController {

    private final SpecialtyService specialtyService;

    @GetMapping
    @PreAuthorize("permitAll()")
    public ApiResponse<List<SpecialtyResponse>> getAll() {
        return ApiResponse.<List<SpecialtyResponse>>builder()
                .status("success")
                .code(200)
                .data(specialtyService.getAll())
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public ApiResponse<SpecialtyResponse> getById(@PathVariable UUID id) {
        return ApiResponse.<SpecialtyResponse>builder()
                .status("success")
                .code(200)
                .data(specialtyService.getById(id))
                .build();
    }
}