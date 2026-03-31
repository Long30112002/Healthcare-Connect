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
    private final MailService mailService;

    @Transactional
    public void execute(String email) {
        // 1. Tìm user theo email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 2. Sinh mã reset password (UUID) và hạn dùng (thường ngắn hơn, 15-30 phút)
        String resetCode = UUID.randomUUID().toString();
        user.setVerificationCode(resetCode);
        user.setVerificationExpiry(LocalDateTime.now().plusMinutes(30));

        userRepository.save(user);

        // 3. Gửi mail với type chuyên biệt
        mailService.sendSecurityEmail(user, "FORGOT_PASSWORD");

        log.info("Đã tạo yêu cầu quên mật khẩu cho: {}", email);
    }
}