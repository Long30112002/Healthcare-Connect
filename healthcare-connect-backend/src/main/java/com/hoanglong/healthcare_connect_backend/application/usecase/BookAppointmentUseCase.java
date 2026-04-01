package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.application.dto.AppointmentResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.NotificationMessage;
import com.hoanglong.healthcare_connect_backend.application.mapper.AppointmentMapper;
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
import com.hoanglong.healthcare_connect_backend.infrastructure.messaging.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookAppointmentUseCase {

    private final IScheduleRepository scheduleRepository;
    private final IAppointmentRepository appointmentRepository;
    private final IUserRepository userRepository;
    private final AppointmentMapper appointmentMapper;
    private final RabbitTemplate rabbitTemplate;

    @Transactional
    public AppointmentResponse execute(UUID patientId, UUID scheduleId, String symptoms) {
        // 1. Tìm và Khóa Slot (Pessimistic Lock)
        Schedule schedule = scheduleRepository.findByIdWithLock(scheduleId)
                .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));

        // 2. Kiểm tra tính hợp lệ của Slot
        if (schedule.getStatus() != ScheduleStatus.AVAILABLE) {
            throw new AppException(ErrorCode.SCHEDULE_NOT_AVAILABLE);
        }

        if (schedule.getCurrentBookings() >= schedule.getMaxPatients()) {
            throw new AppException(ErrorCode.SCHEDULE_FULL);
        }

        List<AppointmentStatus> excludedStatuses = List.of(AppointmentStatus.CANCELLED);

        if (appointmentRepository.existsByPatientOverlap(patientId, schedule.getDate(), schedule.getStartTime(), excludedStatuses)) {
            throw new AppException(ErrorCode.PATIENT_HAS_OVERLAP_APPOINTMENT);
        }

        // 4. Tạo cuộc hẹn mới
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .schedule(schedule)
                .appointmentDate(LocalDateTime.now())
                .status(AppointmentStatus.PENDING)
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

        // CHÈN LOGIC GỬI TIN NHẮN
        NotificationMessage message = NotificationMessage.builder()
                .recipientEmail(patient.getEmail())
                .patientName(patient.getFullName())
                .appointmentTime(schedule.getStartTime().toString())
                .message("Lịch khám của bạn đã được hệ thống ghi nhận thành công!")
                .build();

        // Ném mẩu giấy vào bưu điện RabbitMQ
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.ROUTING_KEY,
                message
        );

        // 6. Map sang Response
        return appointmentMapper.toResponse(savedAppointment);
    }
}