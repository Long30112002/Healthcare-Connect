package com.hoanglong.healthcare_connect_backend.infrastructure.job;

import com.hoanglong.healthcare_connect_backend.core.repository.InvalidatedTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Component
@RequiredArgsConstructor
@Slf4j
public class TokenCleanupJob {
    private final InvalidatedTokenRepository invalidatedTokenRepository;

    // Chạy vào lúc 1 giờ sáng mỗi ngày
    @Scheduled(cron = "0 0 1 * * *")
    @Transactional
    public void cleanupExpiredTokens() {
        log.info("Bắt đầu dọn dẹp Token đã hết hạn...");

        // Xóa tất cả token có expiryTime nhỏ hơn thời điểm hiện tại
        invalidatedTokenRepository.deleteAllByExpiryTimeBefore(new Date());

        log.info("Dọn dẹp hoàn tất!");
    }
}