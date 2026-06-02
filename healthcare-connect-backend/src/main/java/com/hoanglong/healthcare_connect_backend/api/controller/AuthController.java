package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.auth.*;
import com.hoanglong.healthcare_connect_backend.application.dto.user.UserResponse;
import com.hoanglong.healthcare_connect_backend.application.service.AuthenticationService;
import com.hoanglong.healthcare_connect_backend.application.usecase.ForgotPasswordUseCase;
import com.hoanglong.healthcare_connect_backend.application.usecase.VerifyUserUseCase;
import com.hoanglong.healthcare_connect_backend.application.usecase.RegisterUserUseCase;
import com.nimbusds.jose.JOSEException;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;

@RestController
@RequestMapping("/api/auth")
@Slf4j
@RequiredArgsConstructor
public class AuthController {
    private final RegisterUserUseCase registerUserUseCase;
    private final AuthenticationService authenticationService;
    private final VerifyUserUseCase verifyUserUseCase;
    private final ForgotPasswordUseCase forgotPasswordUseCase;

    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@RequestBody @Valid UserRegistrationRequest request) {
        return registerUserUseCase.execute(request);
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        var result = authenticationService.authenticate(request);

        // Tạo HttpOnly Cookie cho Access Token
        ResponseCookie cookie = ResponseCookie.from("accessToken", result.getAccessToken())
                .httpOnly(true)               // Bảo mật XSS
                .secure(true)                // Để false khi chạy localhost (đổi thành true khi lên HTTPS)
                .path("/")                    // Có hiệu lực cho toàn bộ domain
                .maxAge(3600)   // Thời gian sống (giây) - khớp với JWT
                .sameSite("None")              // Chống CSRF cơ bản Lax
                .build();

        // Thêm cookie vào header Set-Cookie
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        log.info("Login successful for user: {}", request.getEmail());
        log.info("Set-Cookie: {}", cookie.toString());

        return ApiResponse.<LoginResponse>builder()
                .status("success")
                .code(200)
                .message("Đăng nhập thành công!")
                .data(result)
                .build();
    }

    @GetMapping("/verify")
    public ApiResponse<String> verify(@RequestParam("code") String code) {
        return verifyUserUseCase.execute(code);
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestBody LogoutRequest request, HttpServletResponse response) throws ParseException, JOSEException {
        authenticationService.logout(request);

        // Xóa Cookie khi logout bằng cách đặt maxAge = 0
        ResponseCookie cookie = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ApiResponse.<Void>builder()
                .status("success")
                .code(200)
                .message("Đăng xuất thành công!")
                .build();
    }

    @PostMapping("/forgot-password")
    public ApiResponse<String> forgotPassword(@RequestParam String email) {
        forgotPasswordUseCase.execute(email);
        return ApiResponse.<String>builder()
                .message("Yêu cầu đã được gửi. Vui lòng kiểm tra email của bạn.")
                .build();
    }

    @PostMapping("/reset-password")
    public ApiResponse<String> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        authenticationService.resetOrSetupPassword(request);
        return ApiResponse.<String>builder()
                .message("Mật khẩu đã được cập nhật thành công.")
                .build();
    }

    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request) {
        var result = authenticationService.introspect(request);
        return ApiResponse.<IntrospectResponse>builder()
                .status("success")
                .code(200)
                .data(result)
                .build();
    }
}