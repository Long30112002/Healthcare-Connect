package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.application.dto.hospital.HospitalWorkingHours;
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
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.HospitalWorkingHoursRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreateScheduleUseCase {
    private final ScheduleRepository scheduleRepository;
    private final DoctorRepository doctorRepository;
    private final ScheduleMapper scheduleMapper;
    private final RoomService roomService;
    private final HospitalWorkingHoursRepository workingHoursRepository;

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

        // 6. KIỂM TRA GIỜ LÀM VIỆC CỦA BỆNH VIỆN (THÊM MỚI)
        validateWorkingHours(doctor.getHospital().getId(), request.getDate(),
                request.getStartTime(), request.getEndTime());

        // 7. Kiểm tra phòng (nếu có chọn)
        Room room = null;
        if (request.getRoomId() != null) {
            room = roomService.getRoomEntityById(request.getRoomId());
            if (!RoomStatus.AVAILABLE.equals(room.getStatus())) {
                throw new AppException(ErrorCode.ROOM_NOT_AVAILABLE);
            }
        }

        // 8. Kiểm tra trùng lịch
        boolean isOverlapped = scheduleRepository.existsOverlappingSchedule(
                doctor.getId(), request.getDate(), request.getStartTime(), request.getEndTime()
        );
        if (isOverlapped) {
            throw new AppException(ErrorCode.SCHEDULE_OVERLAP);
        }

        // 9. Tạo schedule
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

        return scheduleMapper.toResponse(savedSchedule);
    }

    // THÊM METHOD VALIDATE GIỜ LÀM VIỆC
    private void validateWorkingHours(UUID hospitalId, LocalDate date,
            LocalTime startTime, LocalTime endTime) {
        int dayOfWeek = getDayOfWeekNumber(date);  // 2=T3,3=T4,4=T5,5=T6,6=T7,7=CN,8=T2

        // Lấy cấu hình giờ làm việc của bệnh viện
        HospitalWorkingHours config = workingHoursRepository
                .findByHospitalIdAndDayOfWeekAndIsActiveTrue(hospitalId, dayOfWeek)
                .orElse(null);

        // Nếu chưa có cấu hình, dùng giá trị mặc định (fallback)
        if (config == null) {
            log.warn("Chưa có cấu hình giờ làm việc cho bệnh viện {} ngày {}. Dùng giá trị mặc định.",
                    hospitalId, dayOfWeek);
            config = getDefaultWorkingHours(dayOfWeek);
        }

        // Kiểm tra trong giờ làm việc
        if (startTime.isBefore(config.getStartTime()) || endTime.isAfter(config.getEndTime())) {
            log.error("Giờ khám nằm ngoài khung giờ làm việc: {} - {}, yêu cầu: {} - {}",
                    config.getStartTime(), config.getEndTime(), startTime, endTime);
            throw new AppException(ErrorCode.SCHEDULE_OUTSIDE_WORKING_HOURS);
        }

        // Kiểm tra giờ nghỉ trưa (nếu có)
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

    // Helper: Lấy số thứ tự ngày trong tuần (2=T3, 3=T4, 4=T5, 5=T6, 6=T7, 7=CN, 8=T2)
    private int getDayOfWeekNumber(LocalDate date) {
        int day = date.getDayOfWeek().getValue();  // Monday=1, Sunday=7
        // Chuyển đổi: T2=8, T3=2, T4=3, T5=4, T6=5, T7=6, CN=7
        return day == 1 ? 8 : day + 1;
    }

    // Giá trị mặc định (fallback) khi chưa có cấu hình trong DB
    private HospitalWorkingHours getDefaultWorkingHours(int dayOfWeek) {
        HospitalWorkingHours defaultConfig = HospitalWorkingHours.builder()
                .startTime(LocalTime.of(7, 30))
                .endTime(LocalTime.of(17, 0))
                .lunchStart(LocalTime.of(12, 0))
                .lunchEnd(LocalTime.of(13, 30))
                .minSlotMinutes(15)
                .maxSlotMinutes(120)
                .build();

        // Thứ 7 (dayOfWeek = 6)
        if (dayOfWeek == 6) {
            defaultConfig.setEndTime(LocalTime.of(12, 0));
            defaultConfig.setLunchStart(null);
            defaultConfig.setLunchEnd(null);
        }
        // Chủ nhật (dayOfWeek = 7)
        else if (dayOfWeek == 7) {
            defaultConfig.setStartTime(LocalTime.of(8, 0));
            defaultConfig.setEndTime(LocalTime.of(11, 0));
            defaultConfig.setLunchStart(null);
            defaultConfig.setLunchEnd(null);
        }
        // Thứ 2 (dayOfWeek = 8) - dùng giống T3-T6
        else if (dayOfWeek == 8) {
            // Giữ nguyên giá trị mặc định
        }

        return defaultConfig;
    }
}