package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.appointment.AppointmentResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.receptionist.ReceptionistListResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.AppointmentMapper;
import com.hoanglong.healthcare_connect_backend.application.mapper.ReceptionistMapper;
import com.hoanglong.healthcare_connect_backend.core.constant.AppointmentStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.ReceptionistStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;
import com.hoanglong.healthcare_connect_backend.core.entity.Receptionist;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.AppointmentRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.ReceptionistRepository;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
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
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReceptionistService {
    private final ReceptionistRepository receptionistRepository;
    private final ReceptionistMapper receptionistMapper;
    private final AppointmentRepository appointmentRepository;
    private final AppointmentMapper appointmentMapper;
    private final ReceptionistAuditLogService receptionistAuditLogService;

    //Admin: Lấy tất cả receptionists
    public Page<ReceptionistListResponse> getAllReceptionists(ReceptionistStatus status, String keyword, Pageable pageable) {
        Page<Receptionist> receptionistPage;

        if (keyword != null && !keyword.isEmpty()) {
            receptionistPage = receptionistRepository.search(keyword, pageable);
        } else if (status != null) {
            receptionistPage = receptionistRepository.findByStatus(status, pageable);
        } else {
            receptionistPage = receptionistRepository.findAll(pageable);
        }

        return receptionistPage.map(receptionistMapper::toListResponse);
    }

    //Manager: Lấy receptionists của bệnh viện mình quản lý
    public Page<ReceptionistListResponse> getReceptionistsByHospital(UUID hospitalId,
            ReceptionistStatus status,
            String keyword,
            Pageable pageable) {
        Page<Receptionist> receptionistPage;

        if (keyword != null && !keyword.isEmpty()) {
            receptionistPage = receptionistRepository.searchByHospital(hospitalId, keyword, pageable);
        } else if (status != null) {
            receptionistPage = receptionistRepository.findByHospitalIdAndStatus(hospitalId, status, pageable);
        } else {
            receptionistPage = receptionistRepository.findByHospitalId(hospitalId, pageable);
        }

        return receptionistPage.map(receptionistMapper::toListResponse);
    }

    public Page<AppointmentResponse> getAppointments(String filter, Pageable pageable, UUID hospitalId) {
        LocalDate today = LocalDate.now();

        switch (filter) {
            case "tomorrow":
                return appointmentRepository.findByHospitalIdAndScheduleDate(hospitalId, today.plusDays(1), pageable)
                        .map(appointmentMapper::toResponse);
            case "week":
                return appointmentRepository.findByHospitalIdAndScheduleDateBetween(hospitalId, today, today.plusDays(7), pageable)
                        .map(appointmentMapper::toResponse);
            case "all":
                return appointmentRepository.findByHospitalIdOrderByScheduleDateAsc(hospitalId, pageable)
                        .map(appointmentMapper::toResponse);
            default: // today
                return appointmentRepository.findByHospitalIdAndScheduleDate(hospitalId, today, pageable)
                        .map(appointmentMapper::toResponse);
        }
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

    //Manager: Lấy hospitalId từ token
    public UUID getCurrentManagerHospitalId() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        // Lấy hospital từ manager (cần implement)
        // Tạm thời return null, sau này sẽ lấy từ Manager entity
        return null;
    }
}