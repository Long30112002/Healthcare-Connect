package com.hoanglong.healthcare_connect_backend.application.service;


import com.hoanglong.healthcare_connect_backend.application.dto.admin.AdminHospitalDetailResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.admin.AdminHospitalListResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.admin.AdminUserDetailResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.admin.AdminUserListResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.hospital.HospitalRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.statistics.admin.AdminDashboardStats;
import com.hoanglong.healthcare_connect_backend.application.dto.statistics.admin.AdminDoctorListResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.statistics.admin.TopHospitalResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.statistics.admin.UserTrendDTO;
import com.hoanglong.healthcare_connect_backend.core.constant.*;
import com.hoanglong.healthcare_connect_backend.core.entity.Doctor;
import com.hoanglong.healthcare_connect_backend.core.entity.Hospital;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final HospitalRepository hospitalRepository;
    private final AppointmentRepository appointmentRepository;
    private final MailService mailService;
    private final ReceptionistRepository receptionistRepository;

    private double calculatePercentageChange(long previous, long current) {
        if (previous == 0) return current > 0 ? 100 : 0;
        return Math.round(((double) (current - previous) / previous) * 1000) / 10.0;
    }

    @Transactional(readOnly = true)
    public AdminDashboardStats getDashboardStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);
        LocalDateTime endOfLastMonth = startOfMonth.minusSeconds(1);

        // Users
        long totalUsers = userRepository.count();
        long newUsersThisMonth = userRepository.countByCreatedAtBetween(startOfMonth, now);
        long newUsersLastMonth = userRepository.countByCreatedAtBetween(startOfLastMonth, endOfLastMonth);
        double usersChange = calculatePercentageChange(newUsersLastMonth, newUsersThisMonth);

        // Doctors
        long totalDoctors = doctorRepository.count();
        long newDoctorsThisMonth = doctorRepository.countByCreatedAtBetween(startOfMonth, now);
        long newDoctorsLastMonth = doctorRepository.countByCreatedAtBetween(startOfLastMonth, endOfLastMonth);
        double doctorsChange = calculatePercentageChange(newDoctorsLastMonth, newDoctorsThisMonth);

        // Hospitals
        long totalHospitals = hospitalRepository.count();
        long newHospitalsThisMonth = hospitalRepository.countByCreatedAtBetween(startOfMonth, now);
        long newHospitalsLastMonth = hospitalRepository.countByCreatedAtBetween(startOfLastMonth, endOfLastMonth);
        double hospitalsChange = calculatePercentageChange(newHospitalsLastMonth, newHospitalsThisMonth);

        // Bookings
        long totalBookings = appointmentRepository.count();
        long newBookingsThisMonth = appointmentRepository.countByAppointmentDateBetween(startOfMonth, now);
        long newBookingsLastMonth = appointmentRepository.countByAppointmentDateBetween(startOfLastMonth, endOfLastMonth);
        double bookingsChange = calculatePercentageChange(newBookingsLastMonth, newBookingsThisMonth);

        // Today, week, month bookings
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        LocalDate startOfMonthDate = today.withDayOfMonth(1);

        long todayBookings = appointmentRepository.countByDate(today);
        long weekBookings = appointmentRepository.countByDateBetween(startOfWeek, today);
        long monthBookings = appointmentRepository.countByDateBetween(startOfMonthDate, today);

        // Rates
        long paidBookings = appointmentRepository.countByIsPaidTrue();
        long cancelledBookings = appointmentRepository.countByStatus(AppointmentStatus.CANCELLED);
        long noShowBookings = appointmentRepository.countByStatus(AppointmentStatus.NO_SHOW);

        double paymentRate = totalBookings > 0 ? (double) paidBookings / totalBookings * 100 : 0;
        double cancelRate = totalBookings > 0 ? (double) cancelledBookings / totalBookings * 100 : 0;
        double noShowRate = totalBookings > 0 ? (double) noShowBookings / totalBookings * 100 : 0;

        return AdminDashboardStats.builder()
                .totalUsers(totalUsers)
                .totalUsersChange(usersChange)
                .totalDoctors(totalDoctors)
                .totalDoctorsChange(doctorsChange)
                .totalHospitals(totalHospitals)
                .totalHospitalsChange(hospitalsChange)
                .totalBookings(totalBookings)
                .totalBookingsChange(bookingsChange)
                .todayBookings(todayBookings)
                .weekBookings(weekBookings)
                .monthBookings(monthBookings)
                .paymentRate(Math.round(paymentRate * 10) / 10.0)
                .cancelRate(Math.round(cancelRate * 10) / 10.0)
                .noShowRate(Math.round(noShowRate * 10) / 10.0)
                .build();
    }

    @Transactional(readOnly = true)
    public List<TopHospitalResponse> getTopHospitals(int limit) {
        List<Object[]> results = hospitalRepository.findTopHospitalsRaw(limit);
        List<TopHospitalResponse> hospitals = new ArrayList<>();
        int rank = 1;
        for (Object[] row : results) {
            hospitals.add(TopHospitalResponse.builder()
                    .id((UUID) row[0])
                    .name((String) row[1])
                    .address((String) row[2])
                    .doctorCount(((Number) row[3]).longValue())
                    .bookingCount(((Number) row[4]).longValue())
                    .revenue(((Number) row[5]).longValue())
                    .rank(rank++)
                    .build());
        }
        return hospitals;
    }

    @Transactional(readOnly = true)
    public List<UserTrendDTO> getUserTrend() {
        LocalDateTime startDate = LocalDateTime.now().minusMonths(11).withDayOfMonth(1).withHour(0).withMinute(0);
        List<Object[]> results = userRepository.getUserTrendRaw(startDate);
        List<UserTrendDTO> trends = new ArrayList<>();
        for (Object[] row : results) {
            trends.add(UserTrendDTO.builder()
                    .month(((Number) row[0]).intValue())
                    .year(((Number) row[1]).intValue())
                    .count(((Number) row[2]).longValue())
                    .build());
        }
        return trends;
    }

    @Transactional(readOnly = true)
    public Page<AdminUserListResponse> getUsers(int page, int size, String keyword,
            String role, Boolean enabled,
            String sortBy, String sortDir) {
        log.info("Lấy danh sách user - page: {}, size: {}, keyword: {}, role: {}, enabled: {}, sortBy: {}, sortDir: {}",
                page, size, keyword, role, enabled, sortBy, sortDir);

        // Xử lý sort
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        UserRole userRole = null;
        if (role != null && !role.isEmpty() && !"ALL".equals(role)) {
            try {
                userRole = UserRole.valueOf(role);
            } catch (IllegalArgumentException e) {
                log.warn("Role không hợp lệ: {}", role);
            }
        }
        Page<User> userPage = userRepository.findAllWithFilters(keyword, userRole, enabled, pageable);

        return userPage.map(user -> AdminUserListResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .enabled(user.getEnabled())
                .createdAt(user.getCreatedAt())
                .build());
    }

    @Transactional(readOnly = true)
    public AdminUserDetailResponse getUserDetail(UUID userId) {
        log.info("Lấy chi tiết user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        AdminUserDetailResponse.AdminUserDetailResponseBuilder responseBuilder = AdminUserDetailResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .enabled(user.getEnabled())
                .createdAt(user.getCreatedAt());

        // Thêm thông tin đặc thù theo role
        switch (user.getRole()) {
            case DOCTOR:
                doctorRepository.findByUserId(userId).ifPresent(doctor -> {
                    responseBuilder.doctorInfo(AdminUserDetailResponse.DoctorInfo.builder()
                            .doctorId(doctor.getId())
                            .doctorCode(doctor.getDoctorCode())
                            .specialtyName(doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : null)
                            .departmentName(doctor.getDepartment() != null ? doctor.getDepartment().getName() : null)
                            .hospitalId(doctor.getHospital() != null ? doctor.getHospital().getId() : null)
                            .hospitalName(doctor.getHospital() != null ? doctor.getHospital().getName() : null)
                            .hospitalAddress(doctor.getHospital() != null ? doctor.getHospital().getAddress() : null)
                            .experienceYears(doctor.getExperienceYears())
                            .degree(doctor.getDegree())
                            .biography(doctor.getBiography())
                            .consultationFee(doctor.getConsultationFee())
                            .cvUrl(doctor.getCvUrl())
                            .status(doctor.getStatus())
                            .verifiedAt(doctor.getStatus() == DoctorStatus.VERIFIED ? doctor.getUpdatedAt() : null)
                            .approvedAt(doctor.getStatus() == DoctorStatus.APPROVED ? doctor.getUpdatedAt() : null)
                            .build());
                });
                break;

            case HOSPITAL_MANAGER:
                hospitalRepository.findByManagerId(userId).ifPresent(hospital -> {
                    responseBuilder.managerInfo(AdminUserDetailResponse.ManagerInfo.builder()
                            .hospitalId(hospital.getId())
                            .hospitalName(hospital.getName())
                            .hospitalAddress(hospital.getAddress())
                            .hospitalPhone(hospital.getHotline())
                            .hospitalEmail(hospital.getEmail())
                            .acceptedAt(hospital.getUpdatedAt())
                            .build());
                });
                break;

            case RECEPTIONIST:
                receptionistRepository.findByUserId(userId).ifPresent(receptionist -> {
                    responseBuilder.receptionistInfo(AdminUserDetailResponse.ReceptionistInfo.builder()
                            .receptionistId(receptionist.getId())
                            .receptionistCode(receptionist.getReceptionistCode())
                            .hospitalId(receptionist.getHospital() != null ? receptionist.getHospital().getId() : null)
                            .hospitalName(receptionist.getHospital() != null ? receptionist.getHospital().getName() : null)
                            .hospitalAddress(receptionist.getHospital() != null ? receptionist.getHospital().getAddress() : null)
                            .cvUrl(receptionist.getCvUrl())
                            .status(receptionist.getStatus())
                            .verifiedAt(receptionist.getStatus() == ReceptionistStatus.VERIFIED ? receptionist.getUpdatedAt() : null)
                            .approvedAt(receptionist.getStatus() == ReceptionistStatus.APPROVED ? receptionist.getUpdatedAt() : null)
                            .build());
                });
                break;

            case PATIENT:
            case ADMIN:
            default:
                // Không có thông tin đặc thù
                break;
        }

        return responseBuilder.build();
    }

    @Transactional
    public Boolean toggleUserStatus(UUID userId, String reason, UUID adminId) {
        log.info("Toggle user status: {}, reason: {}", userId, reason);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Không cho phép khóa tài khoản ADMIN
        if (user.getRole() == UserRole.ADMIN) {
            throw new AppException(ErrorCode.CANNOT_LOCK_ADMIN_ACCOUNT);
        }

        // Lấy thông tin Admin để gửi email (cần tên)
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        boolean newStatus = !Boolean.TRUE.equals(user.getEnabled());
        LocalDateTime now = LocalDateTime.now();

        if (!newStatus) {
            // ===== ĐANG KHÓA TÀI KHOẢN =====
            user.setEnabled(false);
            user.setLockReason(reason);
            user.setLockedAt(now);
            user.setLockedBy(admin);
            // Xóa thông tin mở khóa cũ (nếu có)
            user.setUnlockedAt(null);
            user.setUnlockedBy(null);

            userRepository.save(user);

            // Gửi email thông báo khóa
            mailService.sendAccountLockedEmail(user, reason, admin);

            log.info("User {} locked by {} at {}", userId, admin.getFullName(), now);
        } else {
            // ===== ĐANG MỞ KHÓA TÀI KHOẢN =====
            user.setEnabled(true);
            user.setUnlockedAt(now);
            user.setUnlockedBy(admin);
            // Giữ lại lockReason để trace (không xóa)

            userRepository.save(user);

            // Gửi email thông báo mở khóa
            mailService.sendAccountUnlockedEmail(user, admin);

            log.info("User {} unlocked by {} at {}", userId, admin.getFullName(), now);
        }

        return newStatus;
    }

    @Transactional
    public void resetUserPassword(UUID userId) {
        log.info("Reset password for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Tạo mã reset mới
        String resetCode = UUID.randomUUID().toString();
        user.setVerificationCode(resetCode);
        user.setVerificationExpiry(LocalDateTime.now().plusMinutes(30));
        userRepository.save(user);

        // Gửi email reset password
        mailService.sendForgotPasswordEmail(user);

        log.info("Reset password email sent to: {}", user.getEmail());
    }

    @Transactional(readOnly = true)
    public Page<AdminDoctorListResponse> getDoctors(int page, int size, String keyword,
            String status, String hospitalId,
            String sortBy, String sortDir) {
        log.info("Lấy danh sách bác sĩ - page: {}, size: {}, keyword: {}, status: {}, hospitalId: {}, sortBy: {}, sortDir: {}",
                page, size, keyword, status, hospitalId, sortBy, sortDir);

        // Xử lý sort
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        // Xử lý status filter
        DoctorStatus doctorStatus = null;
        if (status != null && !status.isEmpty() && !"ALL".equals(status)) {
            try {
                doctorStatus = DoctorStatus.valueOf(status);
            } catch (IllegalArgumentException e) {
                log.warn("Status không hợp lệ: {}", status);
            }
        }

        // Xử lý hospitalId filter
        UUID hospitalUuid = null;
        if (hospitalId != null && !hospitalId.isEmpty() && !"ALL".equals(hospitalId)) {
            try {
                hospitalUuid = UUID.fromString(hospitalId);
            } catch (IllegalArgumentException e) {
                log.warn("hospitalId không hợp lệ: {}", hospitalId);
            }
        }

        Page<Doctor> doctorPage = doctorRepository.findAllWithFilters(keyword, doctorStatus, hospitalUuid, pageable);

        return doctorPage.map(doctor -> AdminDoctorListResponse.builder()
                .id(doctor.getId())
                .doctorCode(doctor.getDoctorCode())
                .fullName(doctor.getUser().getFullName())
                .email(doctor.getUser().getEmail())
                .phone(doctor.getUser().getPhone())
                .specialtyName(doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : null)
                .departmentName(doctor.getDepartment() != null ? doctor.getDepartment().getName() : null)
                .hospitalName(doctor.getHospital() != null ? doctor.getHospital().getName() : null)
                .hospitalId(doctor.getHospital() != null ? doctor.getHospital().getId() : null)
                .experienceYears(doctor.getExperienceYears())
                .consultationFee(doctor.getConsultationFee())
                .status(doctor.getStatus())
                .createdAt(doctor.getCreatedAt())
                .build());
    }

    public byte[] exportUsersToExcel(String keyword, String role, Boolean enabled) {
        log.info("Export users to Excel - keyword: {}, role: {}, enabled: {}", keyword, role, enabled);

        // Lấy danh sách user (không phân trang, lấy tất cả)
        UserRole userRole = null;
        if (role != null && !role.isEmpty() && !"ALL".equals(role)) {
            try {
                userRole = UserRole.valueOf(role);
            } catch (IllegalArgumentException e) {
                log.warn("Role không hợp lệ: {}", role);
            }
        }

        Page<User> users = userRepository.findAllWithFilters(keyword, userRole, enabled, Pageable.unpaged());

        // Tạo workbook Excel
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Danh sách người dùng");

        // Tạo header style
        CellStyle headerStyle = getHeaderCellStyle(workbook);

        // Tạo header row
        Row headerRow = sheet.createRow(0);
        String[] headers = {"STT", "Họ tên", "Email", "Số điện thoại", "Vai trò", "Trạng thái", "Ngày tạo", "Lý do khóa"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Đổ dữ liệu
        int rowNum = 1;
        for (User user : users) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(rowNum - 1);
            row.createCell(1).setCellValue(user.getFullName());
            row.createCell(2).setCellValue(user.getEmail());
            row.createCell(3).setCellValue(user.getPhone() != null ? user.getPhone() : "");
            row.createCell(4).setCellValue(getRoleVietnamese(user.getRole()));
            row.createCell(5).setCellValue(Boolean.TRUE.equals(user.getEnabled()) ? "Hoạt động" : "Đã khóa");
            row.createCell(6).setCellValue(formatDateTime(user.getCreatedAt()));
            row.createCell(7).setCellValue(user.getLockReason() != null ? user.getLockReason() : "");
        }

        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
            // Giới hạn độ rộng tối đa để tránh quá rộng
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

    private String getRoleVietnamese(UserRole role) {
        if (role == null) return "";
        switch (role) {
            case PATIENT: return "Bệnh nhân";
            case DOCTOR: return "Bác sĩ";
            case ADMIN: return "Quản trị viên";
            case HOSPITAL_MANAGER: return "Quản lý bệnh viện";
            case RECEPTIONIST: return "Lễ tân";
            default: return role.name();
        }
    }

    private String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        return dateTime.format(formatter);
    }

    private String formatDate(LocalDate date) {
        if (date == null) return "";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        return date.format(formatter);
    }

    public byte[] exportDoctorsToExcel(String keyword, String status, String hospitalId) {
        log.info("Export doctors to Excel - keyword: {}, status: {}, hospitalId: {}", keyword, status, hospitalId);

        // Xử lý status filter
        DoctorStatus doctorStatus = null;
        if (status != null && !status.isEmpty() && !"ALL".equals(status)) {
            try {
                doctorStatus = DoctorStatus.valueOf(status);
            } catch (IllegalArgumentException e) {
                log.warn("Status không hợp lệ: {}", status);
            }
        }

        // Xử lý hospitalId filter
        UUID hospitalUuid = null;
        if (hospitalId != null && !hospitalId.isEmpty() && !"ALL".equals(hospitalId)) {
            try {
                hospitalUuid = UUID.fromString(hospitalId);
            } catch (IllegalArgumentException e) {
                log.warn("hospitalId không hợp lệ: {}", hospitalId);
            }
        }

        // Lấy danh sách bác sĩ (không phân trang, lấy tất cả)
        Page<Doctor> doctors = doctorRepository.findAllWithFilters(keyword, doctorStatus, hospitalUuid, Pageable.unpaged());

        // Tạo workbook Excel
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Danh sách bác sĩ");

        // Tạo header style
        CellStyle headerStyle = getHeaderCellStyle(workbook);

        // Tạo header row
        Row headerRow = sheet.createRow(0);
        String[] headers = {"STT", "Mã bác sĩ", "Họ tên", "Email", "Số điện thoại",
                "Chuyên khoa", "Bệnh viện", "Kinh nghiệm", "Phí khám",
                "Trạng thái", "Ngày đăng ký"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Đổ dữ liệu
        int rowNum = 1;
        for (Doctor doctor : doctors) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(rowNum - 1);
            row.createCell(1).setCellValue(doctor.getDoctorCode());
            row.createCell(2).setCellValue(doctor.getUser().getFullName());
            row.createCell(3).setCellValue(doctor.getUser().getEmail());
            row.createCell(4).setCellValue(doctor.getUser().getPhone() != null ? doctor.getUser().getPhone() : "");
            row.createCell(5).setCellValue(doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : "");
            row.createCell(6).setCellValue(doctor.getHospital() != null ? doctor.getHospital().getName() : "");
            row.createCell(7).setCellValue(doctor.getExperienceYears() != null ? String.valueOf(doctor.getExperienceYears()) : "");
            row.createCell(8).setCellValue(doctor.getConsultationFee() != null ? String.valueOf(doctor.getConsultationFee()) : "");
            row.createCell(9).setCellValue(getStatusVietnamese(doctor.getStatus()));
            row.createCell(10).setCellValue(formatDateTime(doctor.getCreatedAt()));
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

    private String getStatusVietnamese(DoctorStatus status) {
        if (status == null) return "";
        switch (status) {
            case PENDING: return "Chờ duyệt";
            case VERIFIED: return "Đã xác thực";
            case APPROVED: return "Đã duyệt";
            case REJECTED: return "Từ chối";
            default: return status.name();
        }
    }

    @Transactional(readOnly = true)
    public Page<AdminHospitalListResponse> getHospitals(int page, int size, String keyword, String sortBy, String sortDir) {
        log.info("Lấy danh sách bệnh viện - page: {}, size: {}, keyword: {}, sortBy: {}, sortDir: {}",
                page, size, keyword, sortBy, sortDir);

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Hospital> hospitalPage = hospitalRepository.findAllWithFilters(keyword, pageable);

        return hospitalPage.map(hospital -> {
            String managerName = hospital.getManager() != null ? hospital.getManager().getFullName() : null;

            // Xác định status
            HospitalStatus status;
            if (hospital.getManager() != null) {
                status = HospitalStatus.ACTIVE;  // Đã có manager
            } else if (hospital.getTempManagerEmail() != null && !hospital.getTempManagerEmail().isEmpty()) {
                status = HospitalStatus.PENDING_CONFIRMATION;  // Đã gửi mail, chờ xác nhận
            } else {
                status = HospitalStatus.REJECTED;  // Chưa có email manager
            }

            return AdminHospitalListResponse.builder()
                    .id(hospital.getId())
                    .name(hospital.getName())
                    .address(hospital.getAddress())
                    .hotline(hospital.getHotline())
                    .email(hospital.getEmail())
                    .managerName(managerName)
                    .managerEmail(hospital.getTempManagerEmail())
                    .status(status)
                    .createdAt(hospital.getCreatedAt())
                    .build();
        });
    }

    @Transactional
    public void resendInvitation(UUID hospitalId) {
        log.info("Gửi lại email mời cho bệnh viện: {}", hospitalId);

        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new AppException(ErrorCode.HOSPITAL_NOT_FOUND));

        // Kiểm tra đã có manager chưa
        if (hospital.getManager() != null) {
            throw new AppException(ErrorCode.HOSPITAL_ALREADY_HAS_MANAGER);
        }

        // Kiểm tra có email mời không
        if (hospital.getTempManagerEmail() == null || hospital.getTempManagerEmail().isEmpty()) {
            throw new AppException(ErrorCode.NO_INVITATION_EMAIL);
        }

        // Tìm user theo email
        User manager = userRepository.findByEmail(hospital.getTempManagerEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Tạo token mới
        String newToken = UUID.randomUUID().toString();
        hospital.setInvitationToken(newToken);
        hospital.setTokenExpiry(LocalDateTime.now().plusHours(24));
        hospitalRepository.save(hospital);

        // Gửi lại mail mời
        mailService.sendManagerInvitation(manager, hospital, newToken);

        log.info("Đã gửi lại email mời cho bệnh viện: {}", hospitalId);
    }

    @Transactional(readOnly = true)
    public AdminHospitalDetailResponse getHospitalDetail(UUID hospitalId) {
        log.info("Lấy chi tiết bệnh viện: {}", hospitalId);

        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new AppException(ErrorCode.HOSPITAL_NOT_FOUND));

        long doctorCount = doctorRepository.countByHospitalId(hospitalId);

        String managerName = hospital.getManager() != null ? hospital.getManager().getFullName() : null;

        return AdminHospitalDetailResponse.builder()
                .id(hospital.getId())
                .name(hospital.getName())
                .address(hospital.getAddress())
                .hotline(hospital.getHotline())
                .email(hospital.getEmail())
                .website(hospital.getWebsite())
                .description(hospital.getDescription())
                .imageUrl(hospital.getImageUrl())
                .managerId(hospital.getManager() != null ? hospital.getManager().getId() : null)
                .managerName(managerName)
                .managerEmail(hospital.getTempManagerEmail())
                .createdAt(hospital.getCreatedAt())
                .updatedAt(hospital.getUpdatedAt())
                .doctorCount(doctorCount)
                .build();
    }

    @Transactional
    public AdminHospitalDetailResponse createHospital(HospitalRequest request) {
        log.info("Tạo bệnh viện mới: {}", request.getName());

        // Kiểm tra tên bệnh viện đã tồn tại chưa
        if (hospitalRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.HOSPITAL_ALREADY_EXISTS);
        }

        // Tìm user theo email manager
        User manager = userRepository.findByEmail(request.getManagerEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Kiểm tra user đã verify email chưa
        if (!Boolean.TRUE.equals(manager.getEnabled())) {
            throw new AppException(ErrorCode.USER_NOT_VERIFIED);
        }

        // Không cho phép mời Admin hoặc Doctor làm Manager
        if (manager.getRole() == UserRole.ADMIN || manager.getRole() == UserRole.DOCTOR) {
            throw new AppException(ErrorCode.INVALID_ROLE_FOR_MANAGER);
        }

        // Kiểm tra user đã là Manager của bệnh viện khác chưa
        if (manager.getRole() == UserRole.HOSPITAL_MANAGER) {
            boolean alreadyManager = hospitalRepository.existsByManagerId(manager.getId());
            if (alreadyManager) {
                throw new AppException(ErrorCode.USER_ALREADY_MANAGER);
            }
        }

        // Tạo token mời
        String token = UUID.randomUUID().toString();

        // Tạo bệnh viện
        Hospital hospital = Hospital.builder()
                .name(request.getName())
                .address(request.getAddress())
                .hotline(request.getHotline())
                .email(request.getEmail())
                .website(request.getWebsite())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .status(HospitalStatus.PENDING_CONFIRMATION)
                .invitationToken(token)
                .tokenExpiry(LocalDateTime.now().plusHours(24))
                .tempManagerEmail(request.getManagerEmail())
                .build();

        Hospital savedHospital = hospitalRepository.save(hospital);

        // Gửi mail mời
        mailService.sendManagerInvitation(manager, savedHospital, token);

        return getHospitalDetail(savedHospital.getId());
    }

    @Transactional
    public void deleteHospital(UUID hospitalId) {
        log.info("Xóa bệnh viện: {}", hospitalId);

        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new AppException(ErrorCode.HOSPITAL_NOT_FOUND));

        // Kiểm tra có bác sĩ không
        if (hospitalRepository.hasDoctors(hospitalId)) {
            throw new AppException(ErrorCode.CANNOT_DELETE_HOSPITAL_HAS_DOCTORS);
        }

        hospitalRepository.delete(hospital);

        log.info("Đã xóa bệnh viện: {}", hospitalId);
    }

    public byte[] exportHospitalsToExcel(String keyword) {
        log.info("Export hospitals to Excel - keyword: {}", keyword);

        // Lấy danh sách bệnh viện (không phân trang)
        Pageable pageable = Pageable.unpaged();
        Page<Hospital> hospitalPage = hospitalRepository.findAllWithFilters(keyword, pageable);
        List<Hospital> hospitals = hospitalPage.getContent();

        // Tạo workbook Excel
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Danh sách bệnh viện");

        // Tạo header style
        CellStyle headerStyle = getHeaderCellStyle(workbook);

        // Tạo header row
        Row headerRow = sheet.createRow(0);
        String[] headers = {"STT", "Tên bệnh viện", "Địa chỉ", "Số điện thoại", "Email", "Website", "Quản lý", "Ngày tạo"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Đổ dữ liệu
        int rowNum = 1;
        for (Hospital hospital : hospitals) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(rowNum - 1);
            row.createCell(1).setCellValue(hospital.getName());
            row.createCell(2).setCellValue(hospital.getAddress());
            row.createCell(3).setCellValue(hospital.getHotline() != null ? hospital.getHotline() : "");
            row.createCell(4).setCellValue(hospital.getEmail() != null ? hospital.getEmail() : "");
            row.createCell(5).setCellValue(hospital.getWebsite() != null ? hospital.getWebsite() : "");

            String managerName = hospital.getManager() != null ? hospital.getManager().getFullName() : "";
            String managerEmail = hospital.getTempManagerEmail() != null ? hospital.getTempManagerEmail() : "";
            String managerInfo = managerName + (managerEmail.isEmpty() ? "" : " (" + managerEmail + ")");
            row.createCell(6).setCellValue(managerInfo);

            row.createCell(7).setCellValue(formatDateTime(hospital.getCreatedAt()));
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
}