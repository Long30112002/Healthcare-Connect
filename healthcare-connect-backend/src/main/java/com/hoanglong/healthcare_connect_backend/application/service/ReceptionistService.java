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
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
    private final CurrentUserService currentUserService;

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

        // 1. Kiểm tra đã check-in chưa
        if (appointment.getCheckInTime() != null) {
            throw new AppException(ErrorCode.ALREADY_CHECKED_IN);
        }

        // 2. Kiểm tra receptionist có thuộc đúng bệnh viện không
        UUID currentHospitalId = currentUserService.getCurrentHospitalId();
        if (!appointment.getHospital().getId().equals(currentHospitalId)) {
            throw new AppException(ErrorCode.RECEPTIONIST_NOT_IN_HOSPITAL);
        }

        // 3. Kiểm tra trạng thái phải là CONFIRMED
        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new AppException(ErrorCode.INVALID_CHECKIN_STATUS);
        }

        // 4. Kiểm tra có đúng ngày khám không
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

    public byte[] exportReceptionistsToExcel(String keyword, String status, String hospitalId) {
        log.info("Export receptionists to Excel - keyword: {}, status: {}, hospitalId: {}",
                keyword, status, hospitalId);

        // Parse status filter
        ReceptionistStatus receptionistStatus = null;
        if (status != null && !status.isEmpty() && !"ALL".equals(status)) {
            try {
                receptionistStatus = ReceptionistStatus.valueOf(status);
            } catch (IllegalArgumentException e) {
                log.warn("Status không hợp lệ: {}", status);
            }
        }

        // Parse hospitalId filter
        UUID hospitalUuid = null;
        if (hospitalId != null && !hospitalId.isEmpty() && !"ALL".equals(hospitalId)) {
            try {
                hospitalUuid = UUID.fromString(hospitalId);
            } catch (IllegalArgumentException e) {
                log.warn("hospitalId không hợp lệ: {}", hospitalId);
            }
        }

        // Lấy danh sách receptionist (không phân trang)
        Page<Receptionist> receptionists = receptionistRepository.findAllWithFilters(
                keyword, receptionistStatus, hospitalUuid, Pageable.unpaged());

        // Tạo workbook Excel
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Danh sách lễ tân");

        // Tạo header style
        CellStyle headerStyle = getHeaderCellStyle(workbook);

        // Tạo header row
        Row headerRow = sheet.createRow(0);
        String[] headers = {"STT", "Mã lễ tân", "Họ tên", "Email", "Số điện thoại",
                "Bệnh viện", "Trạng thái", "Ngày đăng ký"};

        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Đổ dữ liệu
        int rowNum = 1;
        for (Receptionist receptionist : receptionists) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(rowNum - 1);
            row.createCell(1).setCellValue(receptionist.getReceptionistCode());
            row.createCell(2).setCellValue(receptionist.getUser().getFullName());
            row.createCell(3).setCellValue(receptionist.getUser().getEmail());
            row.createCell(4).setCellValue(receptionist.getUser().getPhone() != null ?
                    receptionist.getUser().getPhone() : "");
            row.createCell(5).setCellValue(receptionist.getHospital() != null ?
                    receptionist.getHospital().getName() : "");
            row.createCell(6).setCellValue(getStatusVietnamese(receptionist.getStatus()));
            row.createCell(7).setCellValue(formatDateTime(receptionist.getCreatedAt()));
        }

        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
            if (sheet.getColumnWidth(i) > 15000) {
                sheet.setColumnWidth(i, 15000);
            }
        }

        // Ghi ra byte array
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            workbook.write(outputStream);
            workbook.close();
            return outputStream.toByteArray();
        } catch (IOException e) {
            log.error("Lỗi khi tạo file Excel: {}", e.getMessage());
            throw new AppException(ErrorCode.FILE_EXPORT_FAILED);
        }
    }

    private CellStyle getHeaderCellStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private String getStatusVietnamese(ReceptionistStatus status) {
        if (status == null) return "";
        switch (status) {
            case PENDING: return "Chờ duyệt";
            case VERIFIED: return "Đã xác thực";
            case APPROVED: return "Đã duyệt";
            case REJECTED: return "Từ chối";
            case INACTIVE: return "Không hoạt động";
            default: return status.name();
        }
    }

    private String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        return dateTime.format(formatter);
    }

    //Manager: Lấy hospitalId từ token
    public UUID getCurrentManagerHospitalId() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        // Lấy hospital từ manager (cần implement)
        // Tạm thời return null, sau này sẽ lấy từ Manager entity
        return null;
    }
}