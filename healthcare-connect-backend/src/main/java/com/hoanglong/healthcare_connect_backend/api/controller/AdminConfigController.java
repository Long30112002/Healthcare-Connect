package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.system_config.SystemConfigResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.system_config.UpdateConfigRequest;
import com.hoanglong.healthcare_connect_backend.application.service.CurrentUserService;
import com.hoanglong.healthcare_connect_backend.application.service.SystemConfigService;
import com.hoanglong.healthcare_connect_backend.core.entity.SystemConfig;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/configs")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Slf4j
public class AdminConfigController {

    private final SystemConfigService systemConfigService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public ApiResponse<List<SystemConfigResponse>> getAllConfigs() {
        log.info("API ADMIN: Lấy tất cả cấu hình hệ thống");
        List<SystemConfigResponse> configs = systemConfigService.getAllConfigsForAdmin();
        return ApiResponse.<List<SystemConfigResponse>>builder()
                .status("success")
                .code(200)
                .data(configs)
                .build();
    }

    @GetMapping("/group/{groupName}")
    public ApiResponse<List<SystemConfigResponse>> getConfigsByGroup(@PathVariable String groupName) {
        log.info("API ADMIN: Lấy cấu hình theo nhóm: {}", groupName);
        List<SystemConfigResponse> configs = systemConfigService.getConfigsByGroup(groupName);
        return ApiResponse.<List<SystemConfigResponse>>builder()
                .status("success")
                .code(200)
                .data(configs)
                .build();
    }

    @PutMapping("/{key}")
    public ApiResponse<SystemConfigResponse> updateConfig(
            @PathVariable String key,
            @Valid @RequestBody UpdateConfigRequest request
    ) {
        log.info("API ADMIN: Cập nhật cấu hình {} = {}", key, request.getConfigValue());
        UUID userId = currentUserService.getCurrentUserId();
        SystemConfigResponse response = systemConfigService.updateConfig(key, request, userId);
        return ApiResponse.<SystemConfigResponse>builder()
                .status("success")
                .code(200)
                .message("Cập nhật cấu hình thành công!")
                .data(response)
                .build();
    }

    @PostMapping
    public ApiResponse<SystemConfigResponse> createConfig(@RequestBody SystemConfig config) {
        log.info("API ADMIN: Tạo cấu hình mới: {} = {}", config.getConfigKey(), config.getConfigValue());
        SystemConfigResponse response = systemConfigService.createConfig(config);
        return ApiResponse.<SystemConfigResponse>builder()
                .status("success")
                .code(201)
                .message("Tạo cấu hình thành công!")
                .data(response)
                .build();
    }

    @DeleteMapping("/{key}")
    public ApiResponse<Void> deleteConfig(@PathVariable String key) {
        log.info("API ADMIN: Xóa cấu hình: {}", key);
        systemConfigService.deleteConfig(key);
        return ApiResponse.<Void>builder()
                .status("success")
                .code(200)
                .message("Xóa cấu hình thành công!")
                .build();
    }

    @PostMapping("/upload-image")
    public ApiResponse<String> uploadImage(@RequestParam("file") MultipartFile file) {
        log.info("API ADMIN: Upload ảnh cấu hình, file name: {}", file.getOriginalFilename());
        String imageUrl = systemConfigService.uploadImage(file);
        return ApiResponse.<String>builder()
                .status("success")
                .code(200)
                .message("Upload ảnh thành công!")
                .data(imageUrl)
                .build();
    }
}