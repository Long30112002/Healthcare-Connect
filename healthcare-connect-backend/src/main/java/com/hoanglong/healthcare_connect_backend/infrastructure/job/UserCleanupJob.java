package com.hoanglong.healthcare_connect_backend.infrastructure.job;

import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.JpaUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserCleanupJob {
    private final JpaUserRepository jpaUserRepository;

    // Chạy vào lúc 2 giờ sáng mỗi ngày
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void cleanupUnverifiedUsers() {
        log.info("Bắt đầu quét tài khoản chưa xác thực...");

        // Tính thời điểm 24h trước
        LocalDateTime threshold = LocalDateTime.now().minusHours(24);

        // Xóa các user chưa enabled và tạo trước thời điểm threshold
        jpaUserRepository.deleteByEnabledFalseAndCreatedAtBefore(threshold);

        log.info("Dọn dẹp hoàn tất!");
    }
}