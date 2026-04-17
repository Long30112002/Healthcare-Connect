package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.application.service.NotificationService;
import com.hoanglong.healthcare_connect_backend.core.constant.AppointmentStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.PaymentStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.ScheduleStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;
import com.hoanglong.healthcare_connect_backend.core.entity.Payment;
import com.hoanglong.healthcare_connect_backend.core.entity.Schedule;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.core.repository.IPaymentRepository;
import com.hoanglong.healthcare_connect_backend.core.repository.IScheduleRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.messaging.payment.PaymentProvider;
import com.hoanglong.healthcare_connect_backend.infrastructure.payment.momo.MomoService;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.AppointmentRepository;
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
    private final IPaymentRepository paymentRepository;
    private final IScheduleRepository scheduleRepository;
    private final NotificationService notificationService;
    private final PaymentProvider paymentProvider;

    @Transactional
    public void execute(UUID appointmentId, String reason) {
        // 1. Kiểm tra quyền
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

        // Kiểm tra quyền
        boolean isPatient = appointment.getPatient() != null
                && appointment.getPatient().getId().toString().equals(currentUserId);

        if (!isAdmin && !isDoctor && !isReceptionist && !isPatient) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // 2. Kiểm tra trạng thái
        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new AppException(ErrorCode.APPOINTMENT_ALREADY_CANCELLED);
        }

        // 3. Kiểm tra nếu đã quá giờ khám
        if (schedule.getStartTime().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.CANNOT_CANCEL_PAST_APPOINTMENT);
        }

        // 4. Kiểm tra thời gian hủy (còn > 24h không?)
        long hoursUntilStart = java.time.Duration.between(LocalDateTime.now(), schedule.getStartTime()).toHours();
        if (hoursUntilStart < 24) {
            throw new AppException(ErrorCode.CANCEL_DEADLINE_PASSED);
        }

        // 5. Xử lý hoàn tiền nếu đã thanh toán
        if (appointment.isPaid()) {
            processRefund(appointment, schedule, hoursUntilStart, isAdmin, isDoctor, reason);
        }else {
            // CHƯA THANH TOÁN: Đánh dấu payment là CANCELLED
            Payment payment = paymentRepository.findByAppointmentId(appointment.getId()).orElse(null);
            if (payment != null && payment.getStatus() == PaymentStatus.PENDING) {
                payment.setStatus(PaymentStatus.CANCELLED);
                paymentRepository.save(payment);
                log.info("==> [REFUND] Cancelled pending payment for appointment: {}", appointment.getId());
            }
        }

        // 6. Cập nhật slot
        if (schedule.getCurrentBookings() > 0) {
            schedule.setCurrentBookings(schedule.getCurrentBookings() - 1);
            if (schedule.getCurrentBookings() < schedule.getMaxPatients()) {
                schedule.setStatus(ScheduleStatus.AVAILABLE);
            }
            scheduleRepository.save(schedule);
        }

        // 7. Cập nhật appointment
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancelReason(reason);
        appointmentRepository.save(appointment);

        // 8. Log ai là người hủy
        String actor = isAdmin ? "ADMIN" : (isDoctor ? "DOCTOR" : (isReceptionist ? "RECEPTIONIST" : "PATIENT"));
        log.info("==> [REFUND] Appointment {} cancelled by {} with reason: {}", appointmentId, actor, reason);
    }

    private void processRefund(Appointment appointment, Schedule schedule,
            long hoursUntilStart, boolean isAdmin,
            boolean isDoctor, String reason) {
        Payment payment = paymentRepository.findByAppointmentId(appointment.getId())
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        if (payment.getStatus() == PaymentStatus.REFUNDED) {
            log.warn("==> [REFUND] Payment already refunded: {}", payment.getId());
            return;
        }

        // Tính số tiền hoàn
        BigDecimal originalAmount = payment.getAmount();
        BigDecimal refundAmount;

        if (hoursUntilStart >= 48) {
            refundAmount = originalAmount;
        } else {
            refundAmount = originalAmount.multiply(new BigDecimal("0.5"));
        }

        String actor = isAdmin ? "Admin" : (isDoctor ? "Bác sĩ" : "Bệnh nhân");

        // GỌI REFUND QUA INTERFACE
        JSONObject refundResult = paymentProvider.refundTransaction(
                payment,
                refundAmount.longValue(),
                "Hủy bởi " + actor + ": " + reason
        );

        if (refundResult != null && refundResult.getInt("resultCode") == 0) {
            payment.setStatus(PaymentStatus.REFUNDED);
            payment.setRefundAmount(refundAmount);
            paymentRepository.save(payment);

            notificationService.sendRealtimeNotification(
                    "/topic/payment/" + appointment.getId(),
                    Map.of(
                            "status", "REFUNDED",
                            "message", "Đã hoàn " + String.format("%,.0f", refundAmount) + "đ"
                    )
            );
            log.info("==> [REFUND] Successfully refunded {}", refundAmount);
        } else {
            log.error("==> [REFUND FAILED] {}", refundResult);
            throw new AppException(ErrorCode.REFUND_FAILED);
        }
    }
}