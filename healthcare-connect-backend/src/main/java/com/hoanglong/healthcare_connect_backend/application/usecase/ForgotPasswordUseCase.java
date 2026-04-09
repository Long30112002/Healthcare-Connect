package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.application.service.MailService;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.core.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ForgotPasswordUseCase {
    private final IUserRepository userRepository;
    private final MailService mailService;

    @Transactional
    public void execute(String email) {
        // 1. Tìm user theo email (KHÔNG NÉM LỖI nếu không tìm thấy)
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // 2. Sinh mã reset password và hạn dùng (30 phút)
            String resetCode = UUID.randomUUID().toString();
            user.setVerificationCode(resetCode);
            user.setVerificationExpiry(LocalDateTime.now().plusMinutes(30));
            userRepository.save(user);

            // 3. Gửi email reset password
            mailService.sendForgotPasswordEmail(user);

            log.info("==> [FORGOT PASSWORD] Đã tạo yêu cầu đặt lại mật khẩu cho: {}", email);
        } else {
            // 4. Log để debug
            log.warn("==> [FORGOT PASSWORD] Yêu cầu đặt lại mật khẩu cho email không tồn tại: {}", email);
        }

        // 5. LUÔN trả về thành công (không phân biệt email có tồn tại hay không)
        // Không throw exception, API vẫn trả về 200 OK
    }
}