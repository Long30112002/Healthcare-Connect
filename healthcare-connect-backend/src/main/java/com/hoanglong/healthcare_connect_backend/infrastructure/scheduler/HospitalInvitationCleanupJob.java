package com.hoanglong.healthcare_connect_backend.infrastructure.scheduler;

import com.hoanglong.healthcare_connect_backend.core.constant.HospitalStatus;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.JpaHospitalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class HospitalInvitationCleanupJob {

    private final JpaHospitalRepository hospitalRepository;

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void cleanupExpiredInvitations() {
        log.info("Bắt đầu dọn dẹp các lời mời quản lý bệnh viện hết hạn...");
        try {
            hospitalRepository.deleteAllByStatusAndTokenExpiryBefore(
                    HospitalStatus.PENDING_CONFIRMATION,
                    LocalDateTime.now()
            );
            log.info("Đã dọn dẹp xong các yêu cầu hết hạn.");
        } catch (Exception e) {
            log.error("Lỗi khi dọn dẹp Hospital Invitation: {}", e.getMessage());
        }
    }
}