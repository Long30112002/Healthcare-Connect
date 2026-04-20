package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.application.dto.ReceptionistCancelRequest;
import com.hoanglong.healthcare_connect_backend.application.service.NotificationService;
import com.hoanglong.healthcare_connect_backend.application.service.ReceptionistAuditLogService;
import com.hoanglong.healthcare_connect_backend.core.constant.AppointmentStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.PaymentMethod;
import com.hoanglong.healthcare_connect_backend.core.constant.PaymentStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.ScheduleStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;
import com.hoanglong.healthcare_connect_backend.core.entity.Payment;
import com.hoanglong.healthcare_connect_backend.core.entity.Receptionist;
import com.hoanglong.healthcare_connect_backend.core.entity.Schedule;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.messaging.payment.PaymentProvider;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.AppointmentRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.PaymentRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.ReceptionistRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.ScheduleRepository;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.cloudinary.json.JSONObject;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProcessRefundUseCase {

    private final AppointmentRepository appointmentRepository;
    private final PaymentRepository paymentRepository;
    private final ScheduleRepository scheduleRepository;
    private final NotificationService notificationService;
    private final PaymentProvider paymentProvider;
    private final ReceptionistAuditLogService receptionistAuditLogService;
    private final ReceptionistRepository receptionistRepository;

    // ==================== ONLINE: User tự hủy ====================
    @Transactional
    public void execute(UUID appointmentId, String reason) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isDoctor = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"));
        boolean isReceptionist = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_RECEPTIONIST"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        Schedule schedule = scheduleRepository.findByIdWithLock(appointment.getSchedule().getId())
                .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));

        boolean isPatient = appointment.getPatient() != null
                && appointment.getPatient().getId().toString().equals(currentUserId);

        if (!isAdmin && !isDoctor && !isReceptionist && !isPatient) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new AppException(ErrorCode.APPOINTMENT_ALREADY_CANCELLED);
        }

        if (schedule.getStartTime().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.CANNOT_CANCEL_PAST_APPOINTMENT);
        }

        long hoursUntilStart = java.time.Duration.between(LocalDateTime.now(), schedule.getStartTime()).toHours();
        if (hoursUntilStart < 24 && !isAdmin) {
            throw new AppException(ErrorCode.CANCEL_DEADLINE_PASSED);
        }

        if (appointment.isPaid()) {
            processRefund(appointment, schedule, hoursUntilStart, isAdmin, isDoctor, reason, null);
        } else {
            Payment payment = paymentRepository.findByAppointmentId(appointment.getId()).orElse(null);
            if (payment != null && payment.getStatus() == PaymentStatus.PENDING) {
                payment.setStatus(PaymentStatus.CANCELLED);
                paymentRepository.save(payment);
                log.info("==> [REFUND] Cancelled pending payment for appointment: {}", appointment.getId());
            }
        }

        updateSlot(schedule);

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancelReason(reason);
        appointmentRepository.save(appointment);

        String actor = isAdmin ? "ADMIN" : (isDoctor ? "DOCTOR" : (isReceptionist ? "RECEPTIONIST" : "PATIENT"));
        log.info("==> [REFUND] Appointment {} cancelled by {} with reason: {}", appointmentId, actor, reason);
    }

    // ==================== OFFLINE: Receptionist hủy ====================
    @Transactional
    public void execute(UUID appointmentId, ReceptionistCancelRequest request, HttpServletRequest httpRequest) {
        log.info("==> [REFUND] Receptionist hủy lịch: {}, lý do: {}, refundMethod: {}, refundAmount: {}",
                appointmentId, request.getReason(), request.getRefundMethod(), request.getRefundAmount());

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isReceptionist = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_RECEPTIONIST"));

        if (!isAdmin && !isReceptionist) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        Schedule schedule = scheduleRepository.findByIdWithLock(appointment.getSchedule().getId())
                .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new AppException(ErrorCode.APPOINTMENT_ALREADY_CANCELLED);
        }

        if (schedule.getStartTime().isBefore(LocalDateTime.now()) && !isAdmin) {
            throw new AppException(ErrorCode.CANNOT_CANCEL_PAST_APPOINTMENT);
        }

        if (appointment.isPaid()) {
            processRefundForReceptionist(appointment, schedule, request, isAdmin, httpRequest);
        } else {
            // CHƯA THANH TOÁN: Đánh dấu payment là CANCELLED
            Payment payment = paymentRepository.findByAppointmentId(appointment.getId()).orElse(null);

            if (payment != null && payment.getStatus() == PaymentStatus.PENDING) {

                String refundMethod = request.getRefundMethod();
                String paymentMethod = payment.getPaymentMethod().name();

                // ========== VALIDATION CHO TRƯỜNG HỢP CHƯA THANH TOÁN ==========

                // 1. Nếu thanh toán bằng MOMO, không được gửi refundMethod khác MOMO
                if (paymentMethod.equals("MOMO") && refundMethod != null && !"MOMO".equals(refundMethod)) {
                    throw new AppException(ErrorCode.REFUND_METHOD_MISMATCH);
                }

                // 2. Nếu thanh toán bằng MOMO, không được gửi refundAmount
                if (paymentMethod.equals("MOMO") && request.getRefundAmount() != null) {
                    throw new AppException(ErrorCode.MOMO_REFUND_NO_MANUAL_AMOUNT);
                }

                // 3. Nếu thanh toán bằng CASH hoặc BANK_TRANSFER, kiểm tra refundAmount
                if (!paymentMethod.equals("MOMO") && request.getRefundAmount() != null) {
                    BigDecimal originalAmount = payment.getAmount();
                    BigDecimal requestedRefundAmount = request.getRefundAmount();

                    if (requestedRefundAmount.compareTo(originalAmount) > 0) {
                        throw new AppException(ErrorCode.REFUND_AMOUNT_EXCEEDS_PAYMENT);
                    }
                    if (requestedRefundAmount.compareTo(BigDecimal.ZERO) < 0) {
                        throw new AppException(ErrorCode.REFUND_AMOUNT_INVALID);
                    }
                }

                payment.setStatus(PaymentStatus.CANCELLED);
                paymentRepository.save(payment);
                log.info("==> [REFUND] Cancelled pending payment for appointment: {}", appointment.getId());

                // 👉 GHI LOG HỦY LỊCH (chưa thanh toán)
                receptionistAuditLogService.logCancelAppointment(appointment, request.getReason(), httpRequest);
            }
        }

        updateSlot(schedule);

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancelReason(request.getReason());
        appointmentRepository.save(appointment);

        String actor = isAdmin ? "ADMIN" : "RECEPTIONIST";
        log.info("==> [REFUND] Appointment {} cancelled by {} with reason: {}", appointmentId, actor, request.getReason());
    }

    // ==================== Xử lý refund cho ONLINE ====================
    private void processRefund(Appointment appointment, Schedule schedule,
            long hoursUntilStart, boolean isAdmin,
            boolean isDoctor, String reason, ReceptionistCancelRequest receptionistRequest) {

        Payment payment = paymentRepository.findByAppointmentId(appointment.getId())
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        if (payment.getStatus() == PaymentStatus.REFUNDED) {
            log.warn("==> [REFUND] Payment already refunded: {}", payment.getId());
            return;
        }

        BigDecimal originalAmount = payment.getAmount();
        BigDecimal refundAmount;
        if (hoursUntilStart >= 48) {
            refundAmount = originalAmount;
        } else {
            refundAmount = originalAmount.multiply(new BigDecimal("0.5"));
        }

        String actor = isAdmin ? "Admin" : (isDoctor ? "Bác sĩ" : "Bệnh nhân");

        JSONObject refundResult = paymentProvider.refundTransaction(
                payment,
                refundAmount.longValue(),
                "Hủy bởi " + actor + ": " + reason
        );

        if (refundResult != null && refundResult.getInt("resultCode") == 0) {
            // Cập nhật payment (chỉ refundAmount và status)
            payment.setRefundAmount(refundAmount);
            payment.setStatus(PaymentStatus.REFUNDED);
            paymentRepository.save(payment);

            notificationService.sendRealtimeNotification(
                    "/topic/payment/" + appointment.getId(),
                    Map.of("status", "REFUNDED", "message", "Đã hoàn " + String.format("%,.0f", refundAmount) + "đ")
            );
            log.info("==> [REFUND] Successfully refunded {}", refundAmount);
        } else {
            log.error("==> [REFUND FAILED] {}", refundResult);
            throw new AppException(ErrorCode.REFUND_FAILED);
        }
    }

    // ==================== Xử lý refund cho OFFLINE (Receptionist) ====================
    private void processRefundForReceptionist(Appointment appointment, Schedule schedule,
            ReceptionistCancelRequest request, boolean isAdmin, HttpServletRequest httpRequest) {

        Payment payment = paymentRepository.findByAppointmentId(appointment.getId())
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        if (payment.getStatus() == PaymentStatus.REFUNDED) {
            log.warn("==> [REFUND] Payment already refunded: {}", payment.getId());
            return;
        }

        String refundMethod = request.getRefundMethod();
        String paymentMethod = payment.getPaymentMethod().name();
        BigDecimal originalAmount = payment.getAmount();
        BigDecimal requestedRefundAmount = request.getRefundAmount();

        // ========== VALIDATION 1: KIỂM TRA PHƯƠNG THỨC HOÀN ==========
        if (paymentMethod.equals("MOMO") && !"MOMO".equals(refundMethod)) {
            throw new AppException(ErrorCode.REFUND_METHOD_MISMATCH);
        }
        if (paymentMethod.equals("CASH") && !"CASH".equals(refundMethod)) {
            throw new AppException(ErrorCode.REFUND_METHOD_MISMATCH);
        }
        if (paymentMethod.equals("BANK_TRANSFER") && !"BANK_TRANSFER".equals(refundMethod)) {
            throw new AppException(ErrorCode.REFUND_METHOD_MISMATCH);
        }

        // ========== VALIDATION 2: MOMO KHÔNG ĐƯỢC NHẬP refundAmount ==========
        if (paymentMethod.equals("MOMO") && requestedRefundAmount != null) {
            throw new AppException(ErrorCode.MOMO_REFUND_NO_MANUAL_AMOUNT);
        }

        // ========== VALIDATION 3: KIỂM TRA SỐ TIỀN HOÀN (CHỈ CHO CASH/BANK) ==========
        if (!paymentMethod.equals("MOMO") && requestedRefundAmount != null) {
            if (requestedRefundAmount.compareTo(originalAmount) > 0) {
                throw new AppException(ErrorCode.REFUND_AMOUNT_EXCEEDS_PAYMENT);
            }
            if (requestedRefundAmount.compareTo(BigDecimal.ZERO) < 0) {
                throw new AppException(ErrorCode.REFUND_AMOUNT_INVALID);
            }
        }

        // Xác định số tiền hoàn
        BigDecimal refundAmount;

        if (paymentMethod.equals("MOMO")) {
            refundAmount = originalAmount;
            log.info("==> [REFUND] MOMO refund - auto 100%: {}", refundAmount);
        } else {
            if (requestedRefundAmount != null && requestedRefundAmount.compareTo(BigDecimal.ZERO) > 0) {
                refundAmount = requestedRefundAmount;
                log.info("==> [REFUND] Manual refund amount: {}", refundAmount);
            } else {
                long hoursUntilStart = java.time.Duration.between(LocalDateTime.now(), schedule.getStartTime()).toHours();
                if (hoursUntilStart >= 48) {
                    refundAmount = originalAmount;
                } else if (hoursUntilStart >= 24) {
                    refundAmount = originalAmount.multiply(new BigDecimal("0.5"));
                } else {
                    refundAmount = BigDecimal.ZERO;
                }
                log.info("==> [REFUND] Auto refund amount based on time: {} (hoursUntilStart={})", refundAmount, hoursUntilStart);
            }
        }

        String finalRefundMethod = refundMethod != null ? refundMethod : paymentMethod;

        // Lấy thông tin người thực hiện
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        String currentUserRole = isAdmin ? "ADMIN" : "RECEPTIONIST";

        // Lấy hospitalId của receptionist
        Receptionist receptionist = receptionistRepository.findByUserId(currentUserId).orElse(null);
        UUID hospitalId = receptionist != null ? receptionist.getHospital().getId() : null;
        log.info("==> [REFUND] Refund details - userId: {}, role: {}, amount: {}, method: {}, paymentMethod: {}",
                currentUserId, currentUserRole, refundAmount, finalRefundMethod, paymentMethod);

        // Cập nhật payment (chỉ refundAmount và status)
        payment.setRefundAmount(refundAmount);
        payment.setStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

        // Ghi log vào receptionist_activity_history (đã có trong method logRefund)
        receptionistAuditLogService.logRefund(
                appointment,
                payment,
                refundAmount,
                finalRefundMethod,
                request.getReason(),
                httpRequest
        );

        // Nếu là MOMO và có hoàn tiền, gọi API MoMo
        if (payment.getPaymentMethod() == PaymentMethod.MOMO && refundAmount.compareTo(BigDecimal.ZERO) > 0) {
            String actor = isAdmin ? "Admin" : "Receptionist";
            JSONObject refundResult = paymentProvider.refundTransaction(
                    payment,
                    refundAmount.longValue(),
                    "Hủy bởi " + actor + ": " + request.getReason()
            );

            if (refundResult == null || refundResult.getInt("resultCode") != 0) {
                log.error("==> [MOMO REFUND FAILED] {}", refundResult);
                throw new AppException(ErrorCode.REFUND_FAILED);
            }
            log.info("==> [MOMO REFUND] Successfully called MoMo refund API");
        }

        notificationService.sendRealtimeNotification(
                "/topic/receptionist/payment/" + appointment.getId(),
                Map.of("status", "REFUNDED", "message", "Đã hoàn " + String.format("%,.0f", refundAmount) + "đ")
        );

        log.info("==> [REFUND] Receptionist refunded {}đ for appointment {}, method: {}",
                refundAmount, appointment.getId(), finalRefundMethod);
    }

    // ==================== Cập nhật slot ====================
    private void updateSlot(Schedule schedule) {
        if (schedule.getCurrentBookings() > 0) {
            schedule.setCurrentBookings(schedule.getCurrentBookings() - 1);
            if (schedule.getCurrentBookings() < schedule.getMaxPatients()) {
                schedule.setStatus(ScheduleStatus.AVAILABLE);
            }
            scheduleRepository.save(schedule);
        }
    }
}