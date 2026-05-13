package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.hospital.SpecialtyRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.hospital.SpecialtyResponse;
import com.hoanglong.healthcare_connect_backend.application.service.CurrentUserService;
import com.hoanglong.healthcare_connect_backend.application.service.SpecialtyService;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/manager/specialties")
@RequiredArgsConstructor
@Slf4j
public class ManagerSpecialtyController {

    private final SpecialtyService specialtyService;
    private final CurrentUserService currentUserService;

    @GetMapping
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<List<SpecialtyResponse>> getMySpecialties() {
        UUID hospitalId = currentUserService.getCurrentHospitalId();
        if (hospitalId == null) {
            throw new AppException(ErrorCode.HOSPITAL_NOT_FOUND);
        }
        return ApiResponse.<List<SpecialtyResponse>>builder()
                .status("success")
                .code(200)
                .data(specialtyService.getAllByHospital(hospitalId))
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<SpecialtyResponse> getById(@PathVariable UUID id) {
        UUID hospitalId = currentUserService.getCurrentHospitalId();
        return ApiResponse.<SpecialtyResponse>builder()
                .status("success")
                .code(200)
                .data(specialtyService.getByIdAndHospital(id, hospitalId))
                .build();
    }

    @PostMapping
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<SpecialtyResponse> create(@Valid @RequestBody SpecialtyRequest request) {
        UUID hospitalId = currentUserService.getCurrentHospitalId();
        if (hospitalId == null) {
            throw new AppException(ErrorCode.HOSPITAL_NOT_FOUND);
        }
        return ApiResponse.<SpecialtyResponse>builder()
                .status("success")
                .code(201)
                .message("Tạo chuyên khoa thành công!")
                .data(specialtyService.create(request, hospitalId))
                .build();
    }

//    @PutMapping("/{id}")
//    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
//    public ApiResponse<SpecialtyResponse> update(@PathVariable UUID id,
//            @Valid @RequestBody SpecialtyRequest request) {
//        UUID hospitalId = currentUserService.getCurrentHospitalId();
//        return ApiResponse.<SpecialtyResponse>builder()
//                .status("success")
//                .code(200)
//                .message("Cập nhật chuyên khoa thành công!")
//                .data(specialtyService.update(id, request, hospitalId))
//                .build();
//    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<SpecialtyResponse> update(@PathVariable UUID id,
            @Valid @RequestBody SpecialtyRequest request) {
        UUID hospitalId = currentUserService.getCurrentHospitalId();
        log.info("UPDATE specialty - id: {}, hospitalId: {}, request: {}", id, hospitalId, request);

        log.info("=== CONTROLLER UPDATE ===");
        log.info("id from path: {}", id);
        log.info("hospitalId from CurrentUserService: {}", hospitalId);
        log.info("request body: {}", request);

        SpecialtyResponse response = specialtyService.update(id, request, hospitalId);
        log.info("UPDATE specialty - response: {}", response);

        return ApiResponse.<SpecialtyResponse>builder()
                .status("success")
                .code(200)
                .message("Cập nhật chuyên khoa thành công!")
                .data(response)
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<String> delete(@PathVariable UUID id) {
        UUID hospitalId = currentUserService.getCurrentHospitalId();
        specialtyService.delete(id, hospitalId);
        return ApiResponse.<String>builder()
                .status("success")
                .code(200)
                .message("Xóa chuyên khoa thành công!")
                .build();
    }
}