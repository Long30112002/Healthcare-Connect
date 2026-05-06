package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.application.dto.appointment.AppointmentResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.hospital.HospitalWorkingHours;
import com.hoanglong.healthcare_connect_backend.application.mapper.AppointmentMapper;
import com.hoanglong.healthcare_connect_backend.application.service.MailService;
import com.hoanglong.healthcare_connect_backend.core.constant.AppointmentStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.BookingType;
import com.hoanglong.healthcare_connect_backend.core.constant.ScheduleStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;
import com.hoanglong.healthcare_connect_backend.core.entity.Schedule;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.entity.UserRole;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.AppointmentRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.HospitalWorkingHoursRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.ScheduleRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreateBookAppointmentUseCase
{
    private final AppointmentRepository appointmentRepository;
    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final AppointmentMapper appointmentMapper;
    private final MailService mailService;
    private final HospitalWorkingHoursRepository workingHoursRepository;

    @Transactional
    public AppointmentResponse execute(UUID patientId, UUID scheduleId, String symptoms) {
        // 1. Kiểm tra bệnh nhân
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!Boolean.TRUE.equals(patient.getEnabled())) {
            throw new AppException(ErrorCode.USER_NOT_VERIFIED);
        }

        // 2. Kiểm tra Schedule
        Schedule schedule = scheduleRepository.findByIdWithLock(scheduleId)
                .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));

        // 2a. Không thể đặt lịch của chính mình
        if (schedule.getDoctor().getUser().getId().equals(patientId)) {
            throw new AppException(ErrorCode.CANNOT_BOOK_WITH_SELF);
        }

        // 2b. Chi 2 role này mới có thể đặt lịch
        if (patient.getRole() != UserRole.PATIENT && patient.getRole() != UserRole.DOCTOR) {
            throw new AppException(ErrorCode.ONLY_PATIENT_OR_DOCTOR_CAN_BOOK);
        }

        // 3a. Kiểm tra lịch có bị hủy không
        if (schedule.getStatus() == ScheduleStatus.CANCELLED) {
            throw new AppException(ErrorCode.SCHEDULE_CANCELLED);
        }

        // 3b. Kiểm tra thời gian đặt
        LocalDateTime minBookingTime = LocalDateTime.now().plusMinutes(30);
        if (schedule.getStartTime().isBefore(minBookingTime)) {
            throw new AppException(ErrorCode.BOOKING_TOO_LATE);
        }

        // 3c. Kiểm tra lịch đã qua giờ khám chưa
        if (schedule.getStartTime().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.SCHEDULE_ALREADY_PASSED);
        }

        // 3d. Kiểm tra lịch đã đầy chưa
        if (schedule.getStatus() != ScheduleStatus.AVAILABLE) {
            throw new AppException(ErrorCode.SCHEDULE_NOT_AVAILABLE);
        }

        // 3d. Double check số lượng
        if (schedule.getCurrentBookings() >= schedule.getMaxPatients()) {
            schedule.setStatus(ScheduleStatus.FULL);
            scheduleRepository.save(schedule);
            throw new AppException(ErrorCode.SCHEDULE_FULL);
        }

        // 3e. KIỂM TRA GIỜ LÀM VIỆC CỦA BỆNH VIỆN (THÊM MỚI)
        validateWorkingHours(schedule.getDoctor().getHospital().getId(),
                schedule.getDate().toLocalDate(),
                schedule.getStartTime().toLocalTime(),
                schedule.getEndTime().toLocalTime());

        // 3f. Kiểm tra bệnh nhân có lịch trùng giờ không
        boolean hasOverlap = appointmentRepository.existsByPatientOverlap(
                patientId,
                schedule.getDate().toLocalDate().toString(),
                schedule.getStartTime().toLocalTime().toString(),
                List.of(AppointmentStatus.CANCELLED.name(), AppointmentStatus.COMPLETED.name())
        );

        if (hasOverlap) {
            throw new AppException(ErrorCode.PATIENT_HAS_OVERLAP_APPOINTMENT);
        }

        // 3g. Kiểm tra đặt trùng lịch
        boolean alreadyBooked = appointmentRepository.existsByPatientIdAndScheduleIdAndStatusNot(
                patientId, scheduleId, AppointmentStatus.CANCELLED
        );
        if (alreadyBooked) {
            throw new AppException(ErrorCode.BOOKING_ALREADY_EXISTS);
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .patientName(patient.getFullName())
                .patientPhone(patient.getPhone())
                .schedule(schedule)
                .doctor(schedule.getDoctor())
                .hospital(schedule.getDoctor().getHospital())
                .appointmentDate(schedule.getDate())
                .status(AppointmentStatus.AWAITING_PAYMENT)
                .symptoms(symptoms)
                .isPaid(false)
                .room(schedule.getRoom())
                .bookingType(BookingType.ONLINE)
                .build();

        int newBookingCount = schedule.getCurrentBookings() + 1;
        schedule.setCurrentBookings(newBookingCount);

        if (newBookingCount >= schedule.getMaxPatients()) {
            schedule.setStatus(ScheduleStatus.FULL);
        }

        scheduleRepository.save(schedule);
        Appointment savedAppointment = appointmentRepository.save(appointment);

        try {
            mailService.sendBookingEmail(patient, schedule);
            log.info("==> [MAIL] Đã gửi email xác nhận đặt lịch đến {}", patient.getEmail());
        } catch (Exception e) {
            log.error("==> [MAIL ERROR] Không thể gửi email xác nhận: {}", e.getMessage());
        }

        log.info("==> [BOOKING SUCCESS] Patient: {}, Schedule: {}, New Count: {}",
                patient.getEmail(), scheduleId, newBookingCount);

        return appointmentMapper.toResponse(savedAppointment);
    }

    // ✅ THÊM METHOD VALIDATE GIỜ LÀM VIỆC (giống hệt trong CreateScheduleUseCase)
    private void validateWorkingHours(UUID hospitalId, LocalDate date,
            LocalTime startTime, LocalTime endTime) {
        int dayOfWeek = getDayOfWeekNumber(date);

        HospitalWorkingHours config = workingHoursRepository
                .findByHospitalIdAndDayOfWeekAndIsActiveTrue(hospitalId, dayOfWeek)
                .orElse(null);

        if (config == null) {
            log.warn("Chưa có cấu hình giờ làm việc cho bệnh viện {} ngày {}. Dùng giá trị mặc định.",
                    hospitalId, dayOfWeek);
            config = getDefaultWorkingHours(dayOfWeek);
        }

        // Kiểm tra trong giờ làm việc
        if (startTime.isBefore(config.getStartTime()) || endTime.isAfter(config.getEndTime())) {
            throw new AppException(ErrorCode.SCHEDULE_OUTSIDE_WORKING_HOURS);
        }

        // Kiểm tra giờ nghỉ trưa
        if (config.getLunchStart() != null && config.getLunchEnd() != null) {
            boolean isOverLunch = startTime.isBefore(config.getLunchEnd())
                    && endTime.isAfter(config.getLunchStart());
            if (isOverLunch) {
                throw new AppException(ErrorCode.SCHEDULE_LUNCH_BREAK);
            }
        }

        // Kiểm tra thời lượng ca
        long minutes = java.time.Duration.between(startTime, endTime).toMinutes();
        if (minutes < config.getMinSlotMinutes()) {
            throw new AppException(ErrorCode.SCHEDULE_TOO_SHORT);
        }
        if (minutes > config.getMaxSlotMinutes()) {
            throw new AppException(ErrorCode.SCHEDULE_TOO_LONG);
        }
    }

    private int getDayOfWeekNumber(LocalDate date) {
        int day = date.getDayOfWeek().getValue();
        return day == 1 ? 8 : day + 1;
    }

    private HospitalWorkingHours getDefaultWorkingHours(int dayOfWeek) {
        HospitalWorkingHours defaultConfig = HospitalWorkingHours.builder()
                .startTime(LocalTime.of(7, 30))
                .endTime(LocalTime.of(17, 0))
                .lunchStart(LocalTime.of(12, 0))
                .lunchEnd(LocalTime.of(13, 30))
                .minSlotMinutes(15)
                .maxSlotMinutes(120)
                .build();

        if (dayOfWeek == 6) {  // Thứ 7
            defaultConfig.setEndTime(LocalTime.of(12, 0));
            defaultConfig.setLunchStart(null);
            defaultConfig.setLunchEnd(null);
        } else if (dayOfWeek == 7) {  // Chủ nhật
            defaultConfig.setStartTime(LocalTime.of(8, 0));
            defaultConfig.setEndTime(LocalTime.of(11, 0));
            defaultConfig.setLunchStart(null);
            defaultConfig.setLunchEnd(null);
        }

        return defaultConfig;
    }
}