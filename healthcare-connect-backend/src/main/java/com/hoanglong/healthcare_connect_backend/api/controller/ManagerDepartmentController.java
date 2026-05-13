package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.hospital.DepartmentRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.hospital.DepartmentResponse;
import com.hoanglong.healthcare_connect_backend.application.service.CurrentUserService;
import com.hoanglong.healthcare_connect_backend.application.service.DepartmentService;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/manager/departments")
@RequiredArgsConstructor
public class ManagerDepartmentController {

    private final DepartmentService departmentService;
    private final CurrentUserService currentUserService;

    @GetMapping
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<List<DepartmentResponse>> getMyDepartments() {
        UUID hospitalId = currentUserService.getCurrentHospitalId();
        if (hospitalId == null) {
            throw new AppException(ErrorCode.HOSPITAL_NOT_FOUND);
        }
        return ApiResponse.<List<DepartmentResponse>>builder()
                .status("success")
                .code(200)
                .data(departmentService.getAllByHospital(hospitalId))
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<DepartmentResponse> getById(@PathVariable UUID id) {
        UUID hospitalId = currentUserService.getCurrentHospitalId();
        return ApiResponse.<DepartmentResponse>builder()
                .status("success")
                .code(200)
                .data(departmentService.getByIdAndHospital(id, hospitalId))
                .build();
    }

    @PostMapping
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<DepartmentResponse> create(@Valid @RequestBody DepartmentRequest request) {
        UUID hospitalId = currentUserService.getCurrentHospitalId();
        if (hospitalId == null) {
            throw new AppException(ErrorCode.HOSPITAL_NOT_FOUND);
        }
        return ApiResponse.<DepartmentResponse>builder()
                .status("success")
                .code(201)
                .message("Tạo khoa thành công!")
                .data(departmentService.createForHospital(request, hospitalId))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<DepartmentResponse> update(@PathVariable UUID id,
            @Valid @RequestBody DepartmentRequest request) {
        UUID hospitalId = currentUserService.getCurrentHospitalId();
        return ApiResponse.<DepartmentResponse>builder()
                .status("success")
                .code(200)
                .message("Cập nhật khoa thành công!")
                .data(departmentService.updateForHospital(id, request, hospitalId))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HOSPITAL_MANAGER')")
    public ApiResponse<String> delete(@PathVariable UUID id) {
        UUID hospitalId = currentUserService.getCurrentHospitalId();
        departmentService.deleteForHospital(id, hospitalId);
        return ApiResponse.<String>builder()
                .status("success")
                .code(200)
                .message("Xóa khoa thành công!")
                .build();
    }
}