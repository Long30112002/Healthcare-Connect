package com.hoanglong.healthcare_connect_backend.infrastructure.job;

import com.hoanglong.healthcare_connect_backend.infrastructure.security.repository.InvalidatedTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class TokenCleanupJob
{
    private final InvalidatedTokenRepository invalidatedTokenRepository;

    // Chạy vào lúc 1 giờ sáng (0 giây, 0 phút, 1 giờ, mỗi ngày, mỗi tháng, mỗi năm)
    @Scheduled(cron = "0 0 1 * * *")
    @Transactional
    public void cleanupExpiredTokens() {
        log.info("Bắt đầu dọn dẹp Token đã hết hạn...");

        // Dùng LocalDateTime.now() cho đồng bộ với Entity
        invalidatedTokenRepository.deleteAllByExpiryTimeBefore(LocalDateTime.now());

        log.info("Dọn dẹp hoàn tất!");
    }
}