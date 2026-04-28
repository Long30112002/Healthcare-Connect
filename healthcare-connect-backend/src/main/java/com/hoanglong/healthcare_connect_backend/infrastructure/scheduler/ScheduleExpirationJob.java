package com.hoanglong.healthcare_connect_backend.infrastructure.scheduler;

import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class ScheduleExpirationJob {

    private final ScheduleRepository scheduleRepository;

    @Scheduled(cron = "0 0 1 * * *") // Chạy lúc 1h sáng mỗi ngày
    @Transactional
    public void expirePastSchedules() {
        LocalDateTime now = LocalDateTime.now();
        int updatedCount = scheduleRepository.updateExpiredSchedules(now);
        log.info("Đã cập nhật {} schedule thành EXPIRED", updatedCount);
    }
}