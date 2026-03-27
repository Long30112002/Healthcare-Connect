package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.UserRegistrationRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.UserResponse;
import com.hoanglong.healthcare_connect_backend.application.service.MailService;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.entity.UserRole;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.JpaUserRepository;
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
    private final JpaUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;

    @Transactional
    @Throttling(limit = 3, duration = 300) // 5 phút chỉ được đăng ký 3 lần
    public ApiResponse<UserResponse> execute(UserRegistrationRequest request) {
        var existingUser = userRepository.findByEmail(request.getEmail());

        // CHỈ XỬ LÝ LƯU NẾU CHƯA CÓ
        if (existingUser.isEmpty()) {
            User user = User.builder()
                    .fullName(request.getFullName())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role(UserRole.PATIENT)
                    .enabled(false)
                    .verificationCode(UUID.randomUUID().toString())
                    .verificationExpiry(LocalDateTime.now().plusHours(24))
                    .build();

            userRepository.save(user);
            sendVerificationEmail(user);
        }
        // Nếu có rồi thì "im lặng" bỏ qua, không làm gì cả

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

    private void sendVerificationEmail(User user) {
        try {
            // Lấy mã trực tiếp từ entity User đã được gán lúc Register
            String verificationCode = user.getVerificationCode();

            // Nếu code bị null (do logic register chưa gán), phải log lỗi ngay
            if (verificationCode == null) {
                log.error("Không tìm thấy mã xác thực cho user: {}", user.getEmail());
                return;
            }

            String verifyUrl = "http://localhost:8080/api/auth/verify?code=" + verificationCode;

            Map<String, Object> variables = new HashMap<>();
            variables.put("name", user.getFullName());
            variables.put("message", "Cảm ơn bạn đã đăng ký. Vui lòng bấm vào nút bên dưới để kích hoạt tài khoản của bạn. Link có hiệu lực trong 24 giờ.");
            variables.put("url", verifyUrl);

            mailService.sendEmail(
                    user.getEmail(),
                    "Xác thực tài khoản Healthcare Connect",
                    "email-template",
                    variables
            );
            log.info("Đã gửi mail xác thực tới: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Lỗi gửi mail xác thực: {}", e.getMessage());
        }
    }

    private void sendWelcomeEmail(User user) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", user.getFullName());

        // Tùy biến lời chào theo Role
        String message = user.getRole() == UserRole.DOCTOR
                ? "Chào mừng Bác sĩ gia nhập hệ thống. Vui lòng kiểm tra lịch trình làm việc tại trang quản trị."
                : "Chào mừng bạn đến với Healthcare Connect. Bạn có thể bắt đầu đặt lịch khám ngay bây giờ.";

        variables.put("message", message);
        variables.put("url", "https://healthcare-connect.com/login"); // Link trang web của bạn

        // Gọi mailService (đã có @Async nên không lo làm chậm luồng register)
        mailService.sendEmail(
                user.getEmail(),
                "Chào mừng bạn đến với Healthcare Connect",
                "email-template", // Tên file HTML trong folder templates
                variables
        );
    }
}