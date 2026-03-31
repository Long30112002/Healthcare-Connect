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
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j // Thêm để log quá trình gửi mail
public class RegisterUserUseCase {
    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final MailService mailService;

    @Transactional
    @Throttling(limit = 3, duration = 300) // 5 phút chỉ được đăng ký 3 lần
    public ApiResponse<UserResponse> execute(UserRegistrationRequest request) {
        var existingUser = userRepository.findByEmail(request.getEmail());

        // CHỈ XỬ LÝ LƯU NẾU CHƯA CÓ
        if (existingUser.isEmpty()) {
            // Dùng Mapper để chuyển hết dữ liệu từ Request sang User
            User user = userMapper.toUser(request);

            // Sau đó mới ghi đè các trường cần xử lý logic riêng
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setRole(UserRole.PATIENT);
            user.setEnabled(false);
            user.setVerificationCode(UUID.randomUUID().toString());
            user.setVerificationExpiry(LocalDateTime.now().plusHours(24));

            userRepository.save(user);
            mailService.sendVerificationEmail(user);
        }

        // TRẢ VỀ CHUNG 1 THÔNG BÁO CHO CẢ 2 TRƯỜNG HỢP
        return ApiResponse.<UserResponse>builder()
                .status("success")
                .code(201)
                .message("Yêu cầu đăng ký đã được ghi nhận. Hãy kiểm tra hòm thư.")
                .data(UserResponse.builder()
                        .email(request.getEmail()) // Chỉ trả về email để xác nhận
                        .build())
                .build();
    }
}