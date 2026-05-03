package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.invitation.ApplicationResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.user.ChangePasswordRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.user.UpdateProfileRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.user.UserResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.UserMapper;
import com.hoanglong.healthcare_connect_backend.application.service.UserService;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
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
    private final UserMapper userMapper;

    @GetMapping("/my-info")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.<UserResponse>builder()
                .status("success")
                .code(200)
                .data(userService.getMyInfo())
                .build();
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Void> changePassword(@RequestBody @Valid ChangePasswordRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        userService.changePassword(currentUserId, request);
        return ApiResponse.<Void>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Đổi mật khẩu thành công!")
                .build();
    }

    @PutMapping("/{userId}/profile")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<UserResponse> updateProfile(
            @PathVariable UUID userId,
            @RequestBody @Valid UpdateProfileRequest request
    ) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        if (!userId.equals(currentUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        User updatedUser = userService.updateProfile(userId, request);
        return ApiResponse.<UserResponse>builder()
                .status("success")
                .code(HttpStatus.OK.value())
                .message("Cập nhật thông tin thành công!")
                .data(userMapper.toResponse(updatedUser))
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