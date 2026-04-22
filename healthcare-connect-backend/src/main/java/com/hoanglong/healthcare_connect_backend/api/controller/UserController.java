package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.ApplicationResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.UserResponse;
import com.hoanglong.healthcare_connect_backend.application.service.UserService; // Giả sử bạn có UserService
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {
    private final UserService userService;

    @GetMapping("/my-info")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.<UserResponse>builder()
                .status("success")
                .code(200)
                .data(userService.getMyInfo())
                .build();
    }


    @GetMapping("/my-applications")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<ApplicationResponse>> getMyApplications() {
        UUID userId = SecurityUtils.getCurrentUserId();
        log.info("==> [API] Lấy danh sách hồ sơ của user: {}", userId);

        List<ApplicationResponse> applications = userService.getMyApplications(userId);

        return ApiResponse.<List<ApplicationResponse>>builder()
                .status("success")
                .code(200)
                .data(applications)
                .build();
    }
}