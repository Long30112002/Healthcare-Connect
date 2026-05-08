package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.schedule.ScheduleRequest;
import com.hoanglong.healthcare_connect_backend.core.constant.ScheduleStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Room;
import com.hoanglong.healthcare_connect_backend.core.entity.Schedule;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.DoctorRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.RoomRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final RoomRepository roomRepository;

    public Page<Schedule> getSchedulesByDoctorId(UUID doctorId, Pageable pageable) {
        return scheduleRepository.findByDoctorId(doctorId, pageable);
    }

    public Schedule getScheduleById(UUID scheduleId, UUID currentUserId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));

        // Kiểm tra quyền sở hữu
        if (!schedule.getDoctor().getUser().getId().equals(currentUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        return schedule;
    }

    @Transactional
    public Schedule updateSchedule(UUID scheduleId, ScheduleRequest request, UUID currentUserId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));

        // Kiểm tra quyền sở hữu
        if (!schedule.getDoctor().getUser().getId().equals(currentUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        // Kiểm tra có booking chưa
        if (schedule.getCurrentBookings() > 0) {
            throw new AppException(ErrorCode.SCHEDULE_HAS_BOOKINGS);
        }

        // Kiểm tra lịch đã qua chưa
        LocalDate requestDate = request.getDate();
        LocalDateTime now = LocalDateTime.now();
        if (requestDate.isBefore(now.toLocalDate())) {
            throw new AppException(ErrorCode.SCHEDULE_DATE_IN_PAST);
        }

        // Kiểm tra giờ hợp lệ
        LocalTime startTime = request.getStartTime();
        LocalTime endTime = request.getEndTime();
        if (startTime.isAfter(endTime) || startTime.equals(endTime)) {
            throw new AppException(ErrorCode.INVALID_SCHEDULE_TIME);
        }

        // Kiểm tra trùng lịch (trừ chính nó)
        boolean isOverlapped = scheduleRepository.existsOverlappingScheduleExcludeSelf(
                schedule.getDoctor().getId(),
                requestDate,
                startTime,
                endTime,
                scheduleId
        );
        if (isOverlapped) {
            throw new AppException(ErrorCode.SCHEDULE_OVERLAP);
        }

        // Cập nhật thông tin
        schedule.setDate(requestDate.atStartOfDay());
        schedule.setStartTime(LocalDateTime.of(requestDate, startTime));
        schedule.setEndTime(LocalDateTime.of(requestDate, endTime));
        schedule.setPrice(request.getPrice());
        schedule.setMaxPatients(request.getMaxPatients());

        if (request.getRoomId() != null) {
            Room room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
            schedule.setRoom(room);
        } else {
            schedule.setRoom(null);
        }

        return scheduleRepository.save(schedule);
    }

    @Transactional
    public void deleteSchedule(UUID scheduleId, UUID currentUserId) {
        // 1. Tìm schedule
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));

        // 2. Kiểm tra đúng bác sĩ
        if (!schedule.getDoctor().getUser().getId().equals(currentUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        // 3. Kiểm tra đã có booking chưa
        if (schedule.getCurrentBookings() > 0) {
            throw new AppException(ErrorCode.SCHEDULE_HAS_BOOKINGS);
        }

        // 4. Kiểm tra lịch đã qua chưa
        if (schedule.getStartTime().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.SCHEDULE_ALREADY_PASSED);
        }

        // 5. Soft delete hoặc update status
        schedule.setStatus(ScheduleStatus.CANCELLED);
        scheduleRepository.save(schedule);

        log.info("Đã xóa lịch làm việc ID: {} bởi bác sĩ ID: {}", scheduleId, currentUserId);
    }

    public Map<String, Object> checkRoomAvailability(UUID roomId, LocalDate date,
            LocalTime startTime, LocalTime endTime) {
        boolean isAvailable = !scheduleRepository.existsOverlappingRoomSchedule(
                roomId, date, startTime, endTime, null
        );

        Map<String, Object> result = new HashMap<>();
        result.put("available", isAvailable);

        if (!isAvailable) {
            String doctorName = scheduleRepository.findConflictingDoctorName(
                    roomId, date, startTime, endTime, null
            );
            result.put("conflictingDoctor", doctorName);
        }

        return result;
    }
}