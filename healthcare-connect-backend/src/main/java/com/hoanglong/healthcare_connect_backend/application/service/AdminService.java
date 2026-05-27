package com.hoanglong.healthcare_connect_backend.application.service;


import com.hoanglong.healthcare_connect_backend.application.dto.admin.AdminUserDetailResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.admin.AdminUserListResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.statistics.admin.AdminDashboardStats;
import com.hoanglong.healthcare_connect_backend.application.dto.statistics.admin.TopHospitalResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.statistics.admin.UserTrendDTO;
import com.hoanglong.healthcare_connect_backend.core.constant.AppointmentStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.ReceptionistStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.entity.UserRole;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
    public Page<AdminUserListResponse> getUsers(int page, int size, String keyword, String role) {
        log.info("Lấy danh sách user - page: {}, size: {}, keyword: {}, role: {}", page, size, keyword, role);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        UserRole userRole = null;
        if (role != null && !role.isEmpty() && !"ALL".equals(role)) {
            try {
                userRole = UserRole.valueOf(role);
            } catch (IllegalArgumentException e) {
                log.warn("Role không hợp lệ: {}", role);
            }
        }

        Page<User> userPage = userRepository.findAllWithFilters(keyword, userRole, pageable);

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
    public Boolean toggleUserStatus(UUID userId) {
        log.info("Toggle user status: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Không cho phép khóa tài khoản ADMIN
        if (user.getRole() == UserRole.ADMIN) {
            throw new AppException(ErrorCode.CANNOT_LOCK_ADMIN_ACCOUNT);
        }

        boolean newStatus = !Boolean.TRUE.equals(user.getEnabled());
        user.setEnabled(newStatus);
        userRepository.save(user);

        log.info("User {} status changed to: {}", userId, newStatus);
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
}