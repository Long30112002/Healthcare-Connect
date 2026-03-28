package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class VerifyUserUseCase {
    private final IUserRepository userRepository;

    public ApiResponse<String> execute(String code) {
        // 1. Kiểm tra mã hết hạn trước (Dùng Query cũ để lấy thời gian hết hạn)
        var userOptional = userRepository.findByVerificationCode(code);

        // 2. Xử lý IDEMPOTENCY (Quan trọng)
        if (userOptional.isEmpty()) {
            // Thay vì báo lỗi 400 ngay, hãy trả về 200 kèm thông báo "Đã kích hoạt"
            // nếu thực tế tài khoản đã mở rồi.
            log.info("Mã code {} không tìm thấy, có thể đã được kích hoạt trước đó.", code);
            return ApiResponse.<String>builder()
                    .status("success")
                    .code(200)
                    .message("Tài khoản của bạn đã được xác thực thành công trước đó. Vui lòng đăng nhập!")
                    .build();
        }

        User user = userOptional.get();

        // 3. Kiểm tra thời gian hết hạn
        if (user.getVerificationExpiry() != null && user.getVerificationExpiry().isBefore(LocalDateTime.now())) {
            return ApiResponse.<String>builder()
                    .status("error")
                    .code(400)
                    .message("Liên kết xác thực đã hết hạn. Vui lòng đăng ký lại.")
                    .build();
        }

        // 4. Kích hoạt bằng @Modifying để tối ưu hiệu năng
        userRepository.verifyUserByCode(code);

        log.info("Tài khoản {} đã xác thực thành công qua mã {}", user.getEmail(), code);

        return ApiResponse.<String>builder()
                .status("success")
                .code(200)
                .message("Xác thực thành công! Giờ bạn đã có thể đăng nhập.")
                .build();
    }
}