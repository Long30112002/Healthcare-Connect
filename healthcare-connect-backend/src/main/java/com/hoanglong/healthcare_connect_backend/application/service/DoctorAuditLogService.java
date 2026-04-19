package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.core.constant.DoctorApplicationStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.DoctorHistory;
import com.hoanglong.healthcare_connect_backend.core.repository.IDoctorHistoryRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorAuditLogService
{

    private final IDoctorHistoryRepository doctorHistoryRepository;

    public void recordDoctorHistory(UUID doctorId, UUID actorId, String actorRole,
            DoctorApplicationStatus action, String oldStatus,
            String newStatus, String note, HttpServletRequest request) {
        DoctorHistory history = DoctorHistory.builder()
                .doctorId(doctorId)
                .actorId(actorId)
                .actorRole(actorRole)
                .action(action.name())
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .note(note)
                .ipAddress(getClientIp(request))
                .userAgent(request.getHeader("User-Agent"))
                .createdAt(LocalDateTime.now())
                .build();
        doctorHistoryRepository.save(history);
        log.info("==> [HISTORY] Recorded {} for doctor {} by {}", action.name(), doctorId, actorRole);
    }

    public void recordDoctorRejection(UUID doctorId, UUID actorId, String actorRole,
            String oldStatus, String rejectionReason,
            String rejectionNote, String note, HttpServletRequest request) {
        DoctorHistory history = DoctorHistory.builder()
                .doctorId(doctorId)
                .actorId(actorId)
                .actorRole(actorRole)
                .action(DoctorApplicationStatus.REJECT.name())
                .oldStatus(oldStatus)
                .newStatus("REJECTED")
                .rejectionReason(rejectionReason)
                .rejectionNote(rejectionNote)
                .note(note)
                .ipAddress(getClientIp(request))
                .userAgent(request.getHeader("User-Agent"))
                .createdAt(LocalDateTime.now())
                .build();
        doctorHistoryRepository.save(history);
        log.info("==> [HISTORY] Rejected doctor {} by {}", doctorId, actorRole);
    }

    public void recordDoctorArchive(UUID doctorId, UUID actorId, String oldStatus,
            String note, HttpServletRequest request) {
        DoctorHistory history = DoctorHistory.builder()
                .doctorId(doctorId)
                .actorId(actorId)
                .actorRole("DOCTOR")
                .action(DoctorApplicationStatus.ARCHIVE.name())
                .oldStatus(oldStatus)
                .newStatus("ARCHIVED")
                .note(note)
                .ipAddress(getClientIp(request))
                .userAgent(request.getHeader("User-Agent"))
                .createdAt(LocalDateTime.now())
                .build();
        doctorHistoryRepository.save(history);
        log.info("==> [HISTORY] Archived doctor {}", doctorId);
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}