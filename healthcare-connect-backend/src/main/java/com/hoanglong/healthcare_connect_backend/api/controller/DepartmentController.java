package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.hospital.DepartmentRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.hospital.DepartmentResponse;
import com.hoanglong.healthcare_connect_backend.application.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {
    private final DepartmentService departmentService;

    @PostMapping
    public ApiResponse<DepartmentResponse> create(@RequestBody DepartmentRequest request) {
        return ApiResponse.<DepartmentResponse>builder()
                .status("success")
                .code(200)
                .data(departmentService.create(request))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<DepartmentResponse> getById(@PathVariable UUID id) {
        return ApiResponse.<DepartmentResponse>builder()
                .status("success")
                .code(200)
                .data(departmentService.getById(id))
                .build();
    }

    @GetMapping
    public ApiResponse<List<DepartmentResponse>> getAll() {
        return ApiResponse.<List<DepartmentResponse>>builder()
                .status("success")
                .code(200)
                .data(departmentService.getAll())
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> delete(@PathVariable UUID id) {
        departmentService.delete(id); // Gọi hàm của BaseService
        return ApiResponse.<String>builder()
                .data("Xóa khoa thành công!")
                .build();
    }
}