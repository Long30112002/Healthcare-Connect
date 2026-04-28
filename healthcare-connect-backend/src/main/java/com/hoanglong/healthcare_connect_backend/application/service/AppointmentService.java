package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.appointment.AppointmentResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.AppointmentMapper;
import com.hoanglong.healthcare_connect_backend.core.constant.*;
import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;
    private final AppointmentMapper appointmentMapper;

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

}
