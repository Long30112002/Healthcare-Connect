package com.hoanglong.healthcare_connect_backend.application.dto.admin;

import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.ReceptionistStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.UserRole;
import lombok.Builder;
import lombok.Data;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminUserDetailResponse {

    // ===== THÔNG TIN CƠ BẢN =====
    UUID id;
    String fullName;
    String email;
    String phone;
    UserRole role;
    Boolean enabled;
    LocalDateTime createdAt;

    // ===== THÔNG TIN KHÓA TÀI KHOẢN
    String lockReason;           // Lý do khóa
    LocalDateTime lockedAt;      // Thời điểm bị khóa
    String lockedByName;         // Tên Admin đã khóa
    LocalDateTime unlockedAt;    // Thời điểm được mở khóa
    String unlockedByName;       // Tên Admin đã mở khóa

    // ===== THÔNG TIN BÁC SĨ (nếu role = DOCTOR) =====
    DoctorInfo doctorInfo;

    // ===== THÔNG TIN QUẢN LÝ BỆNH VIỆN (nếu role = HOSPITAL_MANAGER) =====
    ManagerInfo managerInfo;

    // ===== THÔNG TIN LỄ TÂN (nếu role = RECEPTIONIST) =====
    ReceptionistInfo receptionistInfo;

    @Data
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class DoctorInfo {
        UUID doctorId;
        String doctorCode;
        String specialtyName;
        String departmentName;
        UUID hospitalId;
        String hospitalName;
        String hospitalAddress;
        Integer experienceYears;
        String degree;
        String biography;
        BigDecimal consultationFee;
        String cvUrl;
        DoctorStatus status;
        LocalDateTime verifiedAt;
        LocalDateTime approvedAt;
    }

    @Data
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class ManagerInfo {
        UUID hospitalId;
        String hospitalName;
        String hospitalAddress;
        String hospitalPhone;
        String hospitalEmail;
        LocalDateTime acceptedAt;
    }

    @Data
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class ReceptionistInfo {
        UUID receptionistId;
        String receptionistCode;
        UUID hospitalId;
        String hospitalName;
        String hospitalAddress;
        String cvUrl;
        ReceptionistStatus status;
        LocalDateTime verifiedAt;
        LocalDateTime approvedAt;
    }
}