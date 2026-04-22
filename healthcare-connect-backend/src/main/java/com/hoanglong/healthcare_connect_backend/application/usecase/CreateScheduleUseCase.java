package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.application.dto.schedule.ScheduleRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.schedule.ScheduleResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.ScheduleMapper;
import com.hoanglong.healthcare_connect_backend.application.service.RoomService;
import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.RoomStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.ScheduleStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Doctor;
import com.hoanglong.healthcare_connect_backend.core.entity.Room;
import com.hoanglong.healthcare_connect_backend.core.entity.Schedule;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.DoctorRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.ScheduleRepository;
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
    private final ScheduleRepository scheduleRepository;
    private final DoctorRepository doctorRepository;
    private final ScheduleMapper scheduleMapper;
    private final RoomService roomService;

    @Transactional
    public ScheduleResponse execute(UUID userId, ScheduleRequest request) {
        // 1. Kiểm tra bác sĩ
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));

        if (doctor.getStatus() != DoctorStatus.APPROVED) {
            throw new AppException(ErrorCode.DOCTOR_NOT_APPROVED);
        }

        // 2. Kiểm tra ngày
        LocalDate today = LocalDate.now();
        if (request.getDate().isBefore(today)) {
            throw new AppException(ErrorCode.SCHEDULE_DATE_IN_PAST);
        }

        // 3. Kiểm tra giờ
        if (request.getStartTime().isAfter(request.getEndTime()) ||
                request.getStartTime().equals(request.getEndTime())) {
            throw new AppException(ErrorCode.INVALID_SCHEDULE_TIME);
        }

        // 4. Kiểm tra số bệnh nhân
        if (request.getMaxPatients() <= 0) {
            throw new AppException(ErrorCode.INVALID_MAX_PATIENTS);
        }

        // 5. Kiểm tra giá
        if (request.getPrice() == null || request.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.INVALID_PRICE);
        }

        // 6. Kiểm tra phòng (nếu có chọn)
        Room room = null;
        if (request.getRoomId() != null) {
            room = roomService.getRoomEntityById(request.getRoomId());
            // Kiểm tra phòng có khả dụng không
            if (!RoomStatus.AVAILABLE.equals(room.getStatus())) {
                throw new AppException(ErrorCode.ROOM_NOT_AVAILABLE);
            }
        }

        // 7. Kiểm tra trùng lịch
        boolean isOverlapped = scheduleRepository.existsOverlappingSchedule(
                doctor.getId(), request.getDate(), request.getStartTime(), request.getEndTime()
        );
        if (isOverlapped) {
            throw new AppException(ErrorCode.SCHEDULE_OVERLAP);
        }

        // 8. Tạo schedule
        Schedule schedule = Schedule.builder()
                .doctor(doctor)
                .date(request.getDate().atStartOfDay())
                .startTime(request.getDate().atTime(request.getStartTime()))
                .endTime(request.getDate().atTime(request.getEndTime()))
                .price(request.getPrice())
                .maxPatients(request.getMaxPatients())
                .currentBookings(0)
                .status(ScheduleStatus.AVAILABLE)
                .room(room)
                .build();

        log.info("==> Bác sĩ {} đã tạo lịch khám ngày {} lúc {}-{} tại phòng {}",
                doctor.getDoctorCode(), request.getDate(), request.getStartTime(),
                request.getEndTime(), room != null ? room.getRoomNumber() : "chưa xác định");

        Schedule savedSchedule = scheduleRepository.save(schedule);

        // 9. Cập nhật trạng thái phòng thành OCCUPIED?
        // Không, phòng chỉ OCCUPIED khi bác sĩ bắt đầu khám thực tế

        return scheduleMapper.toResponse(savedSchedule);
    }
}