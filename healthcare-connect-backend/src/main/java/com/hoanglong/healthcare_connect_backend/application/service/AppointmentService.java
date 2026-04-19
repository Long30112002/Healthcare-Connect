package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.AppointmentResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.AppointmentMapper;
import com.hoanglong.healthcare_connect_backend.core.constant.*;
import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.AppointmentRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.ReceptionistRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;
    private final AppointmentMapper appointmentMapper;
    private final ReceptionistAuditLogService receptionistAuditLogService;

    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getPatientAppointments(UUID patientId, Pageable pageable) {
        log.info("==> [SERVICE] Đang truy vấn danh sách lịch hẹn cho Patient ID: {}", patientId);
        Page<Appointment> appointmentPage = appointmentRepository.findAllByPatientId(patientId, pageable);
        return appointmentPage.map(appointmentMapper::toResponse);
    }

    public Page<AppointmentResponse> getDoctorAppointments(UUID doctorId, String status, Pageable pageable) {
        Page<Appointment> appointmentPage;

        if (status != null && !status.isEmpty()) {
            AppointmentStatus appointmentStatus = AppointmentStatus.valueOf(status);
            appointmentPage = appointmentRepository.findByScheduleDoctorIdAndStatus(doctorId, appointmentStatus, pageable);
        } else {
            appointmentPage = appointmentRepository.findByScheduleDoctorId(doctorId, pageable);
        }

        return appointmentPage.map(appointmentMapper::toResponse);
    }

    @Transactional
    public void checkIn(UUID appointmentId, HttpServletRequest httpRequest) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));

        // Chỉ được check-in khi đang ở trạng thái CONFIRMED
        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new AppException(ErrorCode.INVALID_CHECKIN_STATUS);
        }

        // Kiểm tra có đúng ngày khám không
        LocalDate today = LocalDate.now();
        LocalDate appointmentDate = appointment.getSchedule().getDate().toLocalDate();

        if (!appointmentDate.equals(today)) {
            throw new AppException(ErrorCode.WRONG_CHECKIN_DATE);
        }

        appointment.setCheckInTime(LocalDateTime.now());
        appointment.setStatus(AppointmentStatus.IN_PROGRESS);
        appointmentRepository.save(appointment);

        String roomNumber = appointment.getRoom() != null ? appointment.getRoom().getRoomNumber() : null;
        receptionistAuditLogService.logCheckIn(appointment, roomNumber, httpRequest);

        log.info("==> [CHECK-IN] Bệnh nhân {} đã check-in lúc {}",
                appointment.getPatient() != null ? appointment.getPatient().getFullName() : appointment.getPatientName(),
                appointment.getCheckInTime());
    }

    @Transactional
    public void completeExam(UUID appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));

        // Chỉ được kết thúc khám khi đang ở trạng thái IN_PROGRESS
        if (appointment.getStatus() != AppointmentStatus.IN_PROGRESS) {
            throw new AppException(ErrorCode.INVALID_COMPLETE_STATUS);
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);

        log.info("==> [COMPLETE] Bệnh nhân {} đã kết thúc khám",
                appointment.getPatient() != null ? appointment.getPatient().getFullName() : appointment.getPatientName());
    }

    // Lấy danh sách lịch hẹn hôm nay
    public List<AppointmentResponse> getTodayAppointments() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);

        // Lấy theo schedule.start_time (thời gian bắt đầu khám)
        List<Appointment> appointments = appointmentRepository.findByScheduleStartTimeBetween(startOfDay, endOfDay);

        return appointments.stream()
                .map(appointmentMapper::toResponse)
                .collect(Collectors.toList());
    }

    // Tìm kiếm lịch hẹn theo keyword (tên, SĐT, mã)
    public List<AppointmentResponse> searchAppointments(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getTodayAppointments();
        }

        List<Appointment> appointments = appointmentRepository.searchAppointments(keyword.trim());

        return appointments.stream()
                .map(appointmentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public Appointment checkInByToken(UUID appointmentId) {
        // 1. Kiểm tra lịch hẹn tồn tại
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));

        // 2. Kiểm tra đã check-in chưa
        if (appointment.getCheckInTime() != null) {
            throw new AppException(ErrorCode.ALREADY_CHECKED_IN);
        }

        // 3. Kiểm tra trạng thái phải là CONFIRMED
        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new AppException(ErrorCode.INVALID_CHECKIN_STATUS);
        }

        // 4. Kiểm tra ngày khám
        LocalDate today = LocalDate.now();
        LocalDate appointmentDate = appointment.getSchedule().getDate().toLocalDate();
        if (!appointmentDate.equals(today)) {
            throw new AppException(ErrorCode.WRONG_CHECKIN_DATE);
        }

        // 5. Kiểm tra khung giờ check-in (30 phút trước đến 30 phút sau)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startTime = appointment.getSchedule().getStartTime();
        LocalDateTime checkInStart = startTime.minusMinutes(30);
        LocalDateTime checkInEnd = startTime.plusMinutes(30);

        if (now.isBefore(checkInStart) || now.isAfter(checkInEnd)) {
            throw new AppException(ErrorCode.CHECKIN_TIME_INVALID);
        }

        // 6. Kiểm tra QR code đã hết hạn chưa (sau giờ khám)
        if (now.isAfter(startTime)) {
            throw new AppException(ErrorCode.QR_CODE_EXPIRED);
        }

        // 7. Cập nhật check-in
        appointment.setCheckInTime(now);
        appointment.setStatus(AppointmentStatus.IN_PROGRESS);
        appointmentRepository.save(appointment);

        // 8. Gửi WebSocket thông báo
        notificationService.sendRealtimeNotification(
                "/topic/doctor/" + appointment.getSchedule().getDoctor().getId(),
                Map.of(
                        "appointmentId", appointment.getId(),
                        "patientName", appointment.getPatient().getFullName(),
                        "status", "CHECKED_IN",
                        "message", "Bệnh nhân đã check-in"
                )
        );

        log.info("==> [CHECK-IN] Bệnh nhân {} đã check-in lúc {}",
                appointment.getPatient().getFullName(), now);

        return appointment;
    }

    public Page<AppointmentResponse> getAppointments(String filter, Pageable pageable) {
        LocalDate today = LocalDate.now();

        switch (filter) {
            case "tomorrow":
                return appointmentRepository.findByScheduleDate(today.plusDays(1), pageable)
                        .map(appointmentMapper::toResponse);
            case "week":
                return appointmentRepository.findByScheduleDateBetween(today, today.plusDays(7), pageable)
                        .map(appointmentMapper::toResponse);
            case "all":
                return appointmentRepository.findAllByOrderByScheduleDateAsc(pageable)
                        .map(appointmentMapper::toResponse);
            default: // today
                return appointmentRepository.findByScheduleDate(today, pageable)
                        .map(appointmentMapper::toResponse);
        }
    }
}
//    @Transactional
//    public void cancelAndRefund(UUID appointmentId, String reason) {
//        // 1. Kiểm tra quyền
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        String currentUserId = authentication.getName();
//        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
//        boolean isDoctor = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"));
//
//        Appointment appointment = appointmentRepository.findById(appointmentId)
//                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
//        Schedule schedule = scheduleRepository.findByIdWithLock(appointment.getSchedule().getId())
//                .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));
//
//        if (!isAdmin && !isDoctor && !appointment.getPatient().getId().toString().equals(currentUserId)) {
//            throw new AppException(ErrorCode.UNAUTHORIZED);
//        }
//
//        // 2. Kiểm tra trạng thái & Thời gian (Deadline 24h)
//        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
//            throw new AppException(ErrorCode.APPOINTMENT_ALREADY_CANCELLED);
//        }
//
//        long hoursUntilStart = java.time.Duration.between(LocalDateTime.now(), schedule.getStartTime()).toHours();
//        if (hoursUntilStart < 24) {
//            throw new AppException(ErrorCode.CANCEL_DEADLINE_PASSED);
//        }
//
//        // 3. Logic tính toán số tiền hoàn
//        if (appointment.isPaid()) {
//            Payment payment = paymentRepository.findByAppointmentId(appointmentId)
//                    .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
//
//            if (payment.getStatus() != PaymentStatus.REFUNDED) {
//                // Tính toán % hoàn tiền
//                BigDecimal originalAmount = payment.getAmount();
//                BigDecimal refundAmountBD;
//
//                if (hoursUntilStart >= 48) {
//                    refundAmountBD = originalAmount; // Hoàn 100%
//                } else {
//                    refundAmountBD = originalAmount.multiply(new BigDecimal("0.5")); // Hoàn 50%
//                }
//
//                long amountToMomo = refundAmountBD.longValue();
//
//                // GỌI MOMO (Đã truyền đủ 3 tham số: payment, amount, description)
//                JSONObject refundResult = momoService.refundTransaction(
//                        payment,
//                        amountToMomo,
//                        "Hủy bởi " + (isAdmin ? "Admin" : (isDoctor ? "Bác sĩ" : "Bệnh nhân")) + ": " + reason
//                );
//
//                if (refundResult != null && refundResult.getInt("resultCode") == 0) {
//                    payment.setStatus(PaymentStatus.REFUNDED);
//                    payment.setRefundAmount(refundAmountBD); // Lưu lại số tiền thực tế đã hoàn
//                    paymentRepository.save(payment);
//
//                    notificationService.sendRealtimeNotification(
//                            "/topic/payment/" + appointmentId,
//                            Map.of("status", "REFUNDED",
//                                    "message", "Đã hoàn " + String.format("%,.0f", refundAmountBD) + "đ vào ví MoMo.")
//                    );
//                } else {
//                    log.error("==> [MOMO REFUND FAILED] {}", refundResult);
//                    throw new AppException(ErrorCode.REFUND_FAILED);
//                }
//            }
//        }
//
//        // 4. CẬP NHẬT SLOT (Giữ nguyên logic của bạn)
//        if (schedule.getCurrentBookings() > 0) {
//            schedule.setCurrentBookings(schedule.getCurrentBookings() - 1);
//            if (schedule.getCurrentBookings() < schedule.getMaxPatients()) {
//                schedule.setStatus(ScheduleStatus.AVAILABLE);
//            }
//            scheduleRepository.save(schedule);
//        }
//
//        // 5. Cập nhật trạng thái Appointment
//        appointment.setStatus(AppointmentStatus.CANCELLED);
//        appointment.setCancelReason(reason);
//        appointmentRepository.save(appointment);
//    }




