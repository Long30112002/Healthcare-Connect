package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.application.dto.ScheduleRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.ScheduleResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.ScheduleMapper;
import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.ScheduleStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Doctor;
import com.hoanglong.healthcare_connect_backend.core.entity.Schedule;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.core.repository.IDoctorRepository;
import com.hoanglong.healthcare_connect_backend.core.repository.IScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreateScheduleUseCase {
    private final IScheduleRepository scheduleRepository;
    private final IDoctorRepository doctorRepository;
    private final ScheduleMapper scheduleMapper;

    @Transactional
    public ScheduleResponse execute(UUID userId, ScheduleRequest request) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));

        if (doctor.getStatus() != DoctorStatus.APPROVED) {
            throw new AppException(ErrorCode.DOCTOR_NOT_APPROVED);
        }

        LocalDate today = LocalDate.now();
        if (request.getDate().isBefore(today)) {
            throw new AppException(ErrorCode.SCHEDULE_DATE_IN_PAST);
        }

        if (request.getStartTime().isAfter(request.getEndTime()) ||
                request.getStartTime().equals(request.getEndTime())) {
            throw new AppException(ErrorCode.INVALID_SCHEDULE_TIME);
        }

        if (request.getMaxPatients() <= 0) {
            throw new AppException(ErrorCode.INVALID_MAX_PATIENTS);
        }

        if (request.getPrice() == null || request.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.INVALID_PRICE);
        }

        boolean isOverlapped = scheduleRepository.existsOverlappingSchedule(
                doctor.getId(), request.getDate(), request.getStartTime(), request.getEndTime()
        );
        if (isOverlapped) {
            throw new AppException(ErrorCode.SCHEDULE_OVERLAP);
        }

        Schedule schedule = Schedule.builder()
                .doctor(doctor)
                .date(request.getDate().atStartOfDay())
                .startTime(request.getDate().atTime(request.getStartTime()))
                .endTime(request.getDate().atTime(request.getEndTime()))
                .price(request.getPrice())
                .maxPatients(request.getMaxPatients())
                .currentBookings(0)
                .status(ScheduleStatus.AVAILABLE)
                .build();

        log.info("==> Bác sĩ {} đã tạo lịch khám ngày {} lúc {}-{}",
                doctor.getDoctorCode(), request.getDate(), request.getStartTime(), request.getEndTime());

        return scheduleMapper.toResponse(scheduleRepository.save(schedule));
    }
}
