package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.UserRegistrationRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.UserResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.UserMapper;
import com.hoanglong.healthcare_connect_backend.application.service.MailService;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.entity.UserRole;
import com.hoanglong.healthcare_connect_backend.core.repository.IUserRepository;
import com.hoanglong.healthcare_connect_backend.shared.annotation.Throttling;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RegisterUserUseCase {
    private final IUserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;

    @Transactional
    @Throttling(limit = 3, duration = 70)
    public ApiResponse<UserResponse> execute(UserRegistrationRequest request) {
        var existingUser = userRepository.findByEmail(request.getEmail());

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            if (!user.getEnabled()) {
                // Cập nhật mã mới nếu chưa kích hoạt
                user.setVerificationCode(UUID.randomUUID().toString());
                user.setVerificationExpiry(LocalDateTime.now().plusHours(24));
                userRepository.save(user);

                // Gọi MailService xử lý logic nội dung
                mailService.sendVerificationEmail(user);
            }
        } else {
            // Đăng ký mới
            User user = userMapper.toUser(request);
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setRole(UserRole.PATIENT);
            user.setEnabled(false);
            user.setVerificationCode(UUID.randomUUID().toString());
            user.setVerificationExpiry(LocalDateTime.now().plusHours(24));

            userRepository.save(user);

            // Gọi MailService xử lý logic nội dung
            mailService.sendVerificationEmail(user);
        }

        return ApiResponse.<UserResponse>builder()
                .status("success")
                .code(201)
                .message("Yêu cầu đăng ký đã được ghi nhận. Hãy kiểm tra hòm thư.")
                .data(UserResponse.builder()
                        .email(request.getEmail())
                        .build())
                .build();
    }
}