package com.hoanglong.healthcare_connect_backend.api.controller;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.*;
import com.hoanglong.healthcare_connect_backend.application.service.AuthenticationService;
import com.hoanglong.healthcare_connect_backend.application.service.VerifyUserUseCase;
import com.hoanglong.healthcare_connect_backend.application.usecase.RegisterUserUseCase;
import com.nimbusds.jose.JOSEException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final RegisterUserUseCase registerUserUseCase;
    private final AuthenticationService authenticationService;
    private final VerifyUserUseCase verifyUserUseCase;

    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@RequestBody @Valid UserRegistrationRequest request) {
        return registerUserUseCase.execute(request);
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest request) {
        var result = authenticationService.authenticate(request);
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
    public ApiResponse<Void> logout(@RequestBody LogoutRequest request) throws ParseException, JOSEException {
        authenticationService.logout(request);
        return ApiResponse.<Void>builder()
                .status("success")
                .code(200)
                .message("Đăng xuất thành công!")
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