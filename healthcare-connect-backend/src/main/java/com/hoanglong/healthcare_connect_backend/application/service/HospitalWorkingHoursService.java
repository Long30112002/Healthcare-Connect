package com.hoanglong.healthcare_connect_backend.application.service;


import com.hoanglong.healthcare_connect_backend.application.dto.hospital.HospitalWorkingHours;
import com.hoanglong.healthcare_connect_backend.application.dto.hospital.WorkingHoursRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.hospital.WorkingHoursResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.WorkingHoursMapper;
import com.hoanglong.healthcare_connect_backend.core.entity.Hospital;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.HospitalRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.HospitalWorkingHoursRepository;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class HospitalWorkingHoursService {

    private final HospitalWorkingHoursRepository workingHoursRepository;
    private final HospitalRepository hospitalRepository;
    private final WorkingHoursMapper workingHoursMapper;

    public List<WorkingHoursResponse> getWorkingHoursByCurrentHospital() {
        UUID hospitalId = getCurrentHospitalId();
        List<HospitalWorkingHours> workingHoursList = workingHoursRepository
                .findByHospitalIdAndIsActiveTrueOrderByDayOfWeekAsc(hospitalId);
        return workingHoursMapper.toResponseList(workingHoursList);
    }

    public HospitalWorkingHours getWorkingHoursByHospitalAndDay(UUID hospitalId, Integer dayOfWeek) {
        return workingHoursRepository
                .findByHospitalIdAndDayOfWeekAndIsActiveTrue(hospitalId, dayOfWeek)
                .orElse(null);  // Có thể null, xử lý fallback ở UseCase
    }

    @Transactional
    public WorkingHoursResponse saveWorkingHours(UUID hospitalId, WorkingHoursRequest request) {
        // 1. Kiểm tra bệnh viện tồn tại
        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new AppException(ErrorCode.HOSPITAL_NOT_FOUND));

        // 2. Kiểm tra quyền
        validateHospitalAccess(hospitalId);

        // 3. Validate dữ liệu đầu vào
        validateWorkingHoursRequest(request);

        // 4. Tìm bản ghi cũ (nếu có)
        Optional<HospitalWorkingHours> existingOpt = workingHoursRepository
                .findByHospitalIdAndDayOfWeekAndIsActiveTrue(hospitalId, request.getDayOfWeek());

        HospitalWorkingHours workingHours;

        if (existingOpt.isPresent()) {
            // UPDATE bản ghi cũ
            workingHours = existingOpt.get();
            workingHours.setStartTime(request.getStartTime());
            workingHours.setEndTime(request.getEndTime());
            workingHours.setLunchStart(request.getLunchStart());
            workingHours.setLunchEnd(request.getLunchEnd());
            workingHours.setMinSlotMinutes(request.getMinSlotMinutes());
            workingHours.setMaxSlotMinutes(request.getMaxSlotMinutes());
            // Không thay đổi isActive, hospital, dayOfWeek, id
            log.info("Updated working hours for hospital: {}, dayOfWeek: {}", hospital.getName(), request.getDayOfWeek());
        } else {
            // INSERT bản ghi mới
            workingHours = workingHoursMapper.toEntity(request);
            workingHours.setHospital(hospital);
            workingHours.setIsActive(true);
            log.info("Inserted new working hours for hospital: {}, dayOfWeek: {}", hospital.getName(), request.getDayOfWeek());
        }

        HospitalWorkingHours saved = workingHoursRepository.save(workingHours);
        return workingHoursMapper.toResponse(saved);
    }

    /**
     * Xóa (vô hiệu hóa) cấu hình giờ làm việc của một ngày
     */
    @Transactional
    public void deactivateWorkingHours(UUID hospitalId, Integer dayOfWeek) {
        validateHospitalAccess(hospitalId);
        workingHoursRepository.deactivateByHospitalIdAndDayOfWeek(hospitalId, dayOfWeek);
        log.info("Deactivated working hours for hospital: {}, dayOfWeek: {}", hospitalId, dayOfWeek);
    }

    public WorkingHoursResponse getWorkingHoursByDay(Integer dayOfWeek) {
        UUID hospitalId = getCurrentHospitalId();
        HospitalWorkingHours workingHours = workingHoursRepository
                .findByHospitalIdAndDayOfWeekAndIsActiveTrue(hospitalId, dayOfWeek)
                .orElse(null);

        if (workingHours == null) {
            return null;
        }
        return workingHoursMapper.toResponse(workingHours);
    }

    public WorkingHoursResponse saveWorkingHours(WorkingHoursRequest request) {
        UUID hospitalId = getCurrentHospitalId();
        return saveWorkingHours(hospitalId, request);  // Gọi method đã có
    }

    public void deactivateWorkingHours(Integer dayOfWeek) {
        UUID hospitalId = getCurrentHospitalId();
        deactivateWorkingHours(hospitalId, dayOfWeek);  // Gọi method đã có
    }

    @Transactional
    public void resetToDefault() {
        UUID hospitalId = getCurrentHospitalId();

        workingHoursRepository.deleteByHospitalId(hospitalId);

        createDefaultWorkingHoursForNewHospital(hospitalId);

        log.info("Reset to default working hours for hospital: {}", hospitalId);
    }

    /**
     * Tạo cấu hình mặc định cho bệnh viện mới (gọi khi tạo bệnh viện)
     */
    @Transactional
    public void createDefaultWorkingHoursForNewHospital(UUID hospitalId) {
        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new AppException(ErrorCode.HOSPITAL_NOT_FOUND));

        // Cấu hình mặc định cho các ngày trong tuần
        // Thứ 2 (8) đến Thứ 6 (6)
        for (int day = 2; day <= 6; day++) {
            createDefaultConfig(hospital, day, LocalTime.of(7, 30), LocalTime.of(17, 0),
                    LocalTime.of(12, 0), LocalTime.of(13, 30), 15, 120);
        }
        // Thứ 7 (7)
        createDefaultConfig(hospital, 7, LocalTime.of(7, 30), LocalTime.of(12, 0),
                null, null, 15, 120);
        // Chủ nhật (8) - thực tế dayOfWeek=8 là Thứ 2, cần kiểm tra lại logic
        // Theo quy ước: 2=T3,3=T4,4=T5,5=T6,6=T7,7=CN,8=T2
        // Vậy Chủ nhật là 7, Thứ 2 là 8
        createDefaultConfig(hospital, 7, LocalTime.of(8, 0), LocalTime.of(11, 0),
                null, null, 15, 120);

        log.info("Created default working hours for new hospital: {}", hospital.getName());
    }

    private void createDefaultConfig(Hospital hospital, Integer dayOfWeek,
            LocalTime startTime, LocalTime endTime,
            LocalTime lunchStart, LocalTime lunchEnd,
            Integer minSlot, Integer maxSlot) {
        HospitalWorkingHours config = HospitalWorkingHours.builder()
                .hospital(hospital)
                .dayOfWeek(dayOfWeek)
                .startTime(startTime)
                .endTime(endTime)
                .lunchStart(lunchStart)
                .lunchEnd(lunchEnd)
                .minSlotMinutes(minSlot)
                .maxSlotMinutes(maxSlot)
                .isActive(true)
                .build();
        workingHoursRepository.save(config);
    }

    // ==================== VALIDATION ====================

    private void validateWorkingHoursRequest(WorkingHoursRequest request) {
        // 1. Kiểm tra startTime < endTime
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new AppException(ErrorCode.TIME_REQUIRED);
        }
        if (request.getStartTime().isAfter(request.getEndTime()) ||
                request.getStartTime().equals(request.getEndTime())) {
            throw new AppException(ErrorCode.INVALID_WORKING_HOURS);
        }

        // 2. Kiểm tra lunchStart < lunchEnd (nếu có)
        if (request.getLunchStart() != null && request.getLunchEnd() != null) {
            if (request.getLunchStart().isAfter(request.getLunchEnd()) ||
                    request.getLunchStart().equals(request.getLunchEnd())) {
                throw new AppException(ErrorCode.INVALID_LUNCH_TIME);
            }
            // 2b. Kiểm tra lunchStart và lunchEnd nằm trong giờ làm việc
            if (request.getLunchStart().isBefore(request.getStartTime()) ||
                    request.getLunchEnd().isAfter(request.getEndTime())) {
                throw new AppException(ErrorCode.LUNCH_OUTSIDE_WORKING_HOURS);
            }
        }

        // 3. Kiểm tra minSlotMinutes < maxSlotMinutes
        if (request.getMinSlotMinutes() != null && request.getMaxSlotMinutes() != null) {
            if (request.getMinSlotMinutes() >= request.getMaxSlotMinutes()) {
                throw new AppException(ErrorCode.INVALID_SLOT_DURATION);
            }
            if (request.getMinSlotMinutes() < 5) {
                throw new AppException(ErrorCode.MIN_SLOT_TOO_SMALL);
            }
            if (request.getMaxSlotMinutes() > 240) {
                throw new AppException(ErrorCode.MAX_SLOT_TOO_LARGE);
            }
        }

        // 4. Kiểm tra ngày hợp lệ (2-8)
        if (request.getDayOfWeek() < 2 || request.getDayOfWeek() > 8) {
            throw new AppException(ErrorCode.INVALID_DAY_OF_WEEK);
        }
    }

    private void validateHospitalAccess(UUID hospitalId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        String currentRole = SecurityUtils.getCurrentUserRole();

        // Admin có full quyền
        if ("ROLE_ADMIN".equals(currentRole)) {
            return;
        }

        // Manager chỉ được sửa bệnh viện của mình
        if ("ROLE_HOSPITAL_MANAGER".equals(currentRole)) {
            Hospital hospital = hospitalRepository.findById(hospitalId)
                    .orElseThrow(() -> new AppException(ErrorCode.HOSPITAL_NOT_FOUND));
            if (hospital.getManager() == null || !hospital.getManager().getId().equals(currentUserId)) {
                throw new AppException(ErrorCode.NOT_HOSPITAL_MANAGER);
            }
            return;
        }

        throw new AppException(ErrorCode.FORBIDDEN);
    }

    private UUID getCurrentHospitalId() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        String currentRole = SecurityUtils.getCurrentUserRole();

        if ("ROLE_ADMIN".equals(currentRole)) {
            // Admin cần chọn bệnh viện cụ thể (sẽ có param)
            throw new AppException(ErrorCode.HOSPITAL_ID_REQUIRED);
        }

        if ("ROLE_HOSPITAL_MANAGER".equals(currentRole)) {
            Hospital hospital = hospitalRepository.findByManagerId(currentUserId)
                    .orElseThrow(() -> new AppException(ErrorCode.MANAGER_NO_HOSPITAL));
            return hospital.getId();
        }

        throw new AppException(ErrorCode.FORBIDDEN);
    }
}