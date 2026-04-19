package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.core.constant.ReceptionistActivityAction;
import com.hoanglong.healthcare_connect_backend.core.constant.ReceptionistApplicationStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.ReceptionistStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;
import com.hoanglong.healthcare_connect_backend.core.entity.Payment;
import com.hoanglong.healthcare_connect_backend.core.entity.Receptionist;
import com.hoanglong.healthcare_connect_backend.core.entity.ReceptionistApplicationHistory;
import com.hoanglong.healthcare_connect_backend.core.entity.ReceptionistActivityHistory;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.ReceptionistActivityHistoryRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.ReceptionistApplicationHistoryRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.ReceptionistRepository;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReceptionistAuditLogService {

    private final ReceptionistApplicationHistoryRepository applicationHistoryRepository;
    private final ReceptionistActivityHistoryRepository activityHistoryRepository;
    private final ReceptionistRepository receptionistRepository;
    private final ObjectMapper objectMapper;

    // ==================== UTILS ====================

    private String getClientIp(HttpServletRequest request) {
        if (request == null) return null;
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }

    public UUID getCurrentReceptionistHospitalId() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        return receptionistRepository.findByUserId(currentUserId)
                .map(r -> r.getHospital().getId())
                .orElseThrow(() -> new AppException(ErrorCode.RECEPTIONIST_NO_HOSPITAL));
    }

    public Receptionist getCurrentReceptionist() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        return receptionistRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.RECEPTIONIST_NOT_FOUND));
    }

    // ==================== APPLICATION LOG (xin việc) ====================

    public void logApplication(UUID receptionistId, ReceptionistApplicationStatus action,
            ReceptionistStatus oldStatus, ReceptionistStatus newStatus,
            String rejectionReason, String rejectionNote, String note,
            HttpServletRequest request) {
        ReceptionistApplicationHistory history = ReceptionistApplicationHistory.builder()
                .receptionistId(receptionistId)
                .actorId(SecurityUtils.getCurrentUserId())
                .actorRole(SecurityUtils.getCurrentUserRole())
                .action(action)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .rejectionReason(rejectionReason)
                .rejectionNote(rejectionNote)
                .note(note)
                .ipAddress(getClientIp(request))
                .userAgent(request != null ? request.getHeader("User-Agent") : null)
                .createdAt(LocalDateTime.now())
                .build();
        applicationHistoryRepository.save(history);
        log.info("==> [AUDIT] Receptionist {} - {}: {} → {}", receptionistId, action, oldStatus, newStatus);
    }

    // ==================== ACTIVITY LOG (nghiệp vụ) ====================
    private void logActivity(UUID receptionistId, UUID hospitalId, ReceptionistActivityAction action,
            UUID appointmentId, UUID paymentId, String targetPatientName,
            String targetPatientPhone, Map<String, Object> changes, String note,
            HttpServletRequest request) {
        try {
            ReceptionistActivityHistory history = ReceptionistActivityHistory.builder()
                    .receptionistId(receptionistId)
                    .hospitalId(hospitalId)
                    .action(action)
                    .appointmentId(appointmentId)
                    .paymentId(paymentId)
                    .targetPatientName(targetPatientName)
                    .targetPatientPhone(targetPatientPhone)
                    .changes(changes != null ? objectMapper.writeValueAsString(changes) : null)
                    .ipAddress(getClientIp(request))
                    .userAgent(request != null ? request.getHeader("User-Agent") : null)
                    .note(note)
                    .createdAt(LocalDateTime.now())
                    .build();
            activityHistoryRepository.save(history);
            log.info("==> [AUDIT] Receptionist {} - {}", receptionistId, action);
        } catch (JsonProcessingException e) {
            log.error("Failed to log activity: {}", e.getMessage());
        }
    }

    public void logCreateWalkIn(Appointment appointment, String paymentMethod, HttpServletRequest request) {
        Map<String, Object> changes = new HashMap<>();
        changes.put("schedule_id", appointment.getSchedule().getId());
        changes.put("doctor_name", appointment.getSchedule().getDoctor().getUser().getFullName());
        changes.put("price", appointment.getSchedule().getPrice());
        changes.put("payment_method", paymentMethod);

        logActivity(
                getCurrentReceptionist().getId(),
                getCurrentReceptionistHospitalId(),
                ReceptionistActivityAction.CREATE_WALK_IN_APPOINTMENT,
                appointment.getId(),
                null,
                appointment.getPatientName(),
                appointment.getPatientPhone(),
                changes,
                null,
                request
        );
    }

    public void logCheckIn(Appointment appointment, String roomNumber, HttpServletRequest request) {
        Map<String, Object> changes = new HashMap<>();
        changes.put("room_number", roomNumber);

        String patientName = appointment.getPatient() != null
                ? appointment.getPatient().getFullName()
                : appointment.getPatientName();
        String patientPhone = appointment.getPatient() != null
                ? appointment.getPatient().getPhone()
                : appointment.getPatientPhone();

        logActivity(
                getCurrentReceptionist().getId(),
                getCurrentReceptionistHospitalId(),
                ReceptionistActivityAction.CHECK_IN,
                appointment.getId(),
                null,
                patientName,
                patientPhone,
                changes,
                null,
                request
        );
    }

    public void logCancelAppointment(Appointment appointment, String cancelReason, HttpServletRequest request) {
        Map<String, Object> changes = new HashMap<>();
        changes.put("cancel_reason", cancelReason);

        String patientName = appointment.getPatient() != null
                ? appointment.getPatient().getFullName()
                : appointment.getPatientName();
        String patientPhone = appointment.getPatient() != null
                ? appointment.getPatient().getPhone()
                : appointment.getPatientPhone();

        logActivity(
                getCurrentReceptionist().getId(),
                getCurrentReceptionistHospitalId(),
                ReceptionistActivityAction.CANCEL_APPOINTMENT,
                appointment.getId(),
                null,
                patientName,
                patientPhone,
                changes,
                null,
                request
        );
    }

    public void logRefund(Appointment appointment, Payment payment, BigDecimal refundAmount,
            String refundMethod, String refundReason, HttpServletRequest request) {
        Map<String, Object> changes = new HashMap<>();
        changes.put("refund_amount", refundAmount);
        changes.put("refund_method", refundMethod);
        changes.put("refund_reason", refundReason);

        String patientName = appointment.getPatient() != null
                ? appointment.getPatient().getFullName()
                : appointment.getPatientName();
        String patientPhone = appointment.getPatient() != null
                ? appointment.getPatient().getPhone()
                : appointment.getPatientPhone();

        logActivity(
                getCurrentReceptionist().getId(),
                getCurrentReceptionistHospitalId(),
                ReceptionistActivityAction.REFUND,
                appointment.getId(),
                payment.getId(),
                patientName,
                patientPhone,
                changes,
                refundReason,
                request
        );
    }
}