package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.application.dto.AppointmentResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.AppointmentMapper;
import com.hoanglong.healthcare_connect_backend.application.service.MailService;
import com.hoanglong.healthcare_connect_backend.core.constant.AppointmentStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.ScheduleStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;
import com.hoanglong.healthcare_connect_backend.core.entity.Schedule;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.core.repository.IAppointmentRepository;
import com.hoanglong.healthcare_connect_backend.core.repository.IScheduleRepository;
import com.hoanglong.healthcare_connect_backend.core.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookAppointmentUseCase {
    private final IAppointmentRepository appointmentRepository;
    private final IScheduleRepository scheduleRepository;
    private final IUserRepository userRepository;
    private final AppointmentMapper appointmentMapper;
    private final MailService mailService; // Tiêm MailService vào

    @Transactional
    public AppointmentResponse execute(UUID patientId, UUID scheduleId, String symptoms) {
        // 1. Kiểm tra bệnh nhân
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 2. Kiểm tra lịch trình (Schedule)
        Schedule schedule = scheduleRepository.findByIdWithLock(scheduleId)
                .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));

        // 3. Kiểm tra xem còn chỗ không
        if (schedule.getStatus() == ScheduleStatus.FULL ||
                schedule.getCurrentBookings() >= schedule.getMaxPatients()) {
            throw new AppException(ErrorCode.SCHEDULE_FULL);
        }

        if (appointmentRepository.existsByPatientIdAndScheduleIdAndStatus(patientId, scheduleId, AppointmentStatus.AWAITING_PAYMENT)) {
            throw new AppException(ErrorCode.BOOKING_ALREADY_EXISTS);
        }

        // 4. Tạo cuộc hẹn mới
        Appointment appointment = Appointment.builder()
                .patient(patient)
                .schedule(schedule)
                .appointmentDate(LocalDateTime.now())
                .status(AppointmentStatus.AWAITING_PAYMENT)
                .symptoms(symptoms)
                .isPaid(false)
                .build();

        // 5. Cập nhật số lượng chỗ trong Schedule
        schedule.setCurrentBookings(schedule.getCurrentBookings() + 1);
        if (schedule.getCurrentBookings() >= schedule.getMaxPatients()) {
            schedule.setStatus(ScheduleStatus.FULL);
        }

        scheduleRepository.save(schedule);
        Appointment savedAppointment = appointmentRepository.save(appointment);

        // 6. Gửi mail thông báo đặt lịch thành công
        mailService.sendBookingEmail(patient, schedule);

        log.info("==> [BOOKING] Bệnh nhân {} đã đặt lịch thành công vào lúc {}",
                patient.getEmail(), schedule.getStartTime());

        return appointmentMapper.toResponse(savedAppointment);
    }
}