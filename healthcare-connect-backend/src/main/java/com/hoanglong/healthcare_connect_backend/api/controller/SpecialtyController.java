package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.hospital.SpecialtyRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.hospital.SpecialtyResponse;
import com.hoanglong.healthcare_connect_backend.application.service.SpecialtyService;
import com.hoanglong.healthcare_connect_backend.application.usecase.CreateSpecialtyUseCase;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/specialties")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SpecialtyController {
    private final SpecialtyService specialtyService;
    CreateSpecialtyUseCase createSpecialtyUseCase;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<SpecialtyResponse> create(@RequestBody @Valid SpecialtyRequest request) {
        return ApiResponse.<SpecialtyResponse>builder()
                .status("success")
                .code(201) // 201 Created
                .message("Tạo chuyên khoa thành công!")
                .data(createSpecialtyUseCase.execute(request))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<SpecialtyResponse> getById(@PathVariable UUID id) {
        return ApiResponse.<SpecialtyResponse>builder()
                .status("success")
                .data(specialtyService.getById(id))
                .build();
    }

    @GetMapping
    @PreAuthorize("permitAll()")
    public ApiResponse<List<SpecialtyResponse>> getAllSpecialties() {
        return ApiResponse.<List<SpecialtyResponse>>builder()
                .status("success")
                .data(specialtyService.getAll())
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> delete(@PathVariable UUID id) {
        specialtyService.delete(id);
        return ApiResponse.<String>builder().data("Xóa chuyên khoa thành công!").build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<SpecialtyResponse> update(@PathVariable UUID id, @RequestBody @Valid SpecialtyRequest request) {
        return ApiResponse.<SpecialtyResponse>builder()
                .data(specialtyService.update(id, request))
                .build();
    }
}
