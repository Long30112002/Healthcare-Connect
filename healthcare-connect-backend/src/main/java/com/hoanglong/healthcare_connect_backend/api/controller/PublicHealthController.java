package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/public")
public class PublicHealthController {

    @GetMapping("/health")
    @PreAuthorize("permitAll()")  // Cho phép tất cả truy cập
    public ApiResponse<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Healthcare Connect Backend");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));

        return ApiResponse.<Map<String, String>>builder()
                .status("success")
                .code(200)
                .message("Service is healthy")
                .data(response)
                .build();
    }
}