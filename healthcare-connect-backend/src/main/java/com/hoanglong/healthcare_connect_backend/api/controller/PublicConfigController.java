package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/configs")
@RequiredArgsConstructor
@Slf4j
public class PublicConfigController {

    private final SystemConfigService systemConfigService;

    @GetMapping
    @PreAuthorize("permitAll()")
    public ApiResponse<Map<String, String>> getAllConfigs() {
        log.info("API: Lấy tất cả cấu hình hệ thống");
        Map<String, String> configs = systemConfigService.getAllConfigs();
        return ApiResponse.<Map<String, String>>builder()
                .status("success")
                .code(200)
                .message("Lấy cấu hình thành công!")
                .data(configs)
                .build();
    }

    @GetMapping("/{key}")
    @PreAuthorize("permitAll()")
    public ApiResponse<String> getConfigByKey(@PathVariable String key) {
        log.info("API: Lấy cấu hình theo key: {}", key);
        String value = systemConfigService.getConfig(key);
        return ApiResponse.<String>builder()
                .status("success")
                .code(200)
                .data(value)
                .build();
    }
}