package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.core.constant.AppointmentStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.PaymentStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.ScheduleStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;
import com.hoanglong.healthcare_connect_backend.core.entity.Payment;
import com.hoanglong.healthcare_connect_backend.core.entity.Schedule;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.core.repository.IAppointmentRepository;
import com.hoanglong.healthcare_connect_backend.core.repository.IPaymentRepository;
import com.hoanglong.healthcare_connect_backend.core.repository.IScheduleRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.payment.momo.MomoService;
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
public class AppointmentService {
    private final IAppointmentRepository appointmentRepository;
    private final IPaymentRepository paymentRepository;
    private final IScheduleRepository scheduleRepository;
    private final MomoService momoService;
    private final NotificationService notificationService;

    @Transactional
    public void cancelAndRefund(UUID appointmentId, String reason) {
        // 1. Kiểm tra quyền (Giữ nguyên logic của bạn)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isDoctor = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        Schedule schedule = scheduleRepository.findByIdWithLock(appointment.getSchedule().getId())
                .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));

        if (!isAdmin && !isDoctor && !appointment.getPatient().getId().toString().equals(currentUserId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // 2. Kiểm tra trạng thái & Thời gian (Deadline 24h)
        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new AppException(ErrorCode.APPOINTMENT_ALREADY_CANCELLED);
        }

        long hoursUntilStart = java.time.Duration.between(LocalDateTime.now(), schedule.getStartTime()).toHours();
        if (hoursUntilStart < 24) {
            throw new AppException(ErrorCode.CANCEL_DEADLINE_PASSED);
        }

        // 3. Logic tính toán số tiền hoàn
        if (appointment.isPaid()) {
            Payment payment = paymentRepository.findByAppointmentId(appointmentId)
                    .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

            if (payment.getStatus() != PaymentStatus.REFUNDED) {
                // Tính toán % hoàn tiền
                BigDecimal originalAmount = payment.getAmount();
                BigDecimal refundAmountBD;

                if (hoursUntilStart >= 48) {
                    refundAmountBD = originalAmount; // Hoàn 100%
                } else {
                    refundAmountBD = originalAmount.multiply(new BigDecimal("0.5")); // Hoàn 50%
                }

                long amountToMomo = refundAmountBD.longValue();

                // GỌI MOMO (Đã truyền đủ 3 tham số: payment, amount, description)
                JSONObject refundResult = momoService.refundTransaction(
                        payment,
                        amountToMomo,
                        "Hủy bởi " + (isAdmin ? "Admin" : (isDoctor ? "Bác sĩ" : "Bệnh nhân")) + ": " + reason
                );

                if (refundResult != null && refundResult.getInt("resultCode") == 0) {
                    payment.setStatus(PaymentStatus.REFUNDED);
                    payment.setRefundAmount(refundAmountBD); // Lưu lại số tiền thực tế đã hoàn
                    paymentRepository.save(payment);

                    notificationService.sendRealtimeNotification(
                            "/topic/payment/" + appointmentId,
                            Map.of("status", "REFUNDED",
                                    "message", "Đã hoàn " + String.format("%,.0f", refundAmountBD) + "đ vào ví MoMo.")
                    );
                } else {
                    log.error("==> [MOMO REFUND FAILED] {}", refundResult);
                    throw new AppException(ErrorCode.REFUND_FAILED);
                }
            }
        }

        // 4. CẬP NHẬT SLOT (Giữ nguyên logic của bạn)
        if (schedule.getCurrentBookings() > 0) {
            schedule.setCurrentBookings(schedule.getCurrentBookings() - 1);
            if (schedule.getCurrentBookings() < schedule.getMaxPatients()) {
                schedule.setStatus(ScheduleStatus.AVAILABLE);
            }
            scheduleRepository.save(schedule);
        }

        // 5. Cập nhật trạng thái Appointment
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancelReason(reason);
        appointmentRepository.save(appointment);
    }
}