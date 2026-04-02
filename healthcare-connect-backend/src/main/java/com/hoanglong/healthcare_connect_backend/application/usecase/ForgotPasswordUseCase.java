package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.application.service.MailService;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.core.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class ForgotPasswordUseCase {
    private final IUserRepository userRepository;
    private final MailService mailService; // Sử dụng MailService tập trung

    @Transactional
    public void execute(String email) {
        // 1. Tìm user theo email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 2. Sinh mã reset password (UUID) và hạn dùng (30 phút)
        String resetCode = UUID.randomUUID().toString();
        user.setVerificationCode(resetCode);
        user.setVerificationExpiry(LocalDateTime.now().plusMinutes(30));

        userRepository.save(user);

        // 3. Gọi Service gửi mail reset password
        mailService.sendForgotPasswordEmail(user);

        log.info("==> [FORGOT PASSWORD] Đã tạo yêu cầu đặt lại mật khẩu cho: {}", email);
    }
}