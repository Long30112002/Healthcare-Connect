package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.application.service.MailService;
import com.hoanglong.healthcare_connect_backend.application.service.ReceptionistAuditLogService;
import com.hoanglong.healthcare_connect_backend.application.service.UserRoleService;
import com.hoanglong.healthcare_connect_backend.core.constant.ReceptionistApplicationStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.ReceptionistStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Hospital;
import com.hoanglong.healthcare_connect_backend.core.entity.Receptionist;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.constant.UserRole;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.HospitalRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.ReceptionistRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.UserRepository;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApproveReceptionistUseCase {

    private final ReceptionistRepository receptionistRepository;
    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final ReceptionistAuditLogService receptionistAuditLogService;
    private final MailService mailService;
    private final UserRoleService userRoleService;

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSPITAL_MANAGER')")
    public void execute(UUID receptionistId, HttpServletRequest httpRequest) {
        // 1. Tìm receptionist
        Receptionist receptionist = receptionistRepository.findById(receptionistId)
                .orElseThrow(() -> new AppException(ErrorCode.RECEPTIONIST_NOT_FOUND));

        boolean isAdmin = SecurityUtils.hasRole("ROLE_ADMIN");
        boolean isManager = SecurityUtils.hasRole("ROLE_HOSPITAL_MANAGER");
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        // KIỂM TRA REJECTED TRƯỚC
        if (receptionist.getStatus() == ReceptionistStatus.REJECTED) {
            throw new AppException(ErrorCode.RECEPTIONIST_ALREADY_REJECTED);
        }

        // ADMIN XỬ LÝ
        if (isAdmin) {
            // Chỉ được approve khi đang PENDING
            if (receptionist.getStatus() == ReceptionistStatus.PENDING) {
                ReceptionistStatus oldStatus = receptionist.getStatus();
                receptionist.setStatus(ReceptionistStatus.VERIFIED);
                receptionistRepository.save(receptionist);

                // Ghi history VERIFY
                receptionistAuditLogService.logApplication(
                        receptionist.getId(),
                        ReceptionistApplicationStatus.VERIFY,
                        oldStatus,
                        ReceptionistStatus.VERIFIED,
                        null,
                        null,
                        "Admin xác thực hồ sơ lễ tân",
                        httpRequest
                );

                // Gửi email xác thực
                mailService.sendProfileVerifiedEmail(
                        receptionist.getUser(),
                        receptionist.getReceptionistCode(),
                        receptionist.getHospital() != null ? receptionist.getHospital().getName() : null,
                        "lễ tân",
                        "/receptionist/profile"
                );
                log.info("==> [APPROVE] Admin đã xác thực lễ tân {} từ PENDING → VERIFIED", receptionistId);
                return;
            }

            // Nếu đã VERIFIED hoặc APPROVED → báo lỗi
            if (receptionist.getStatus() == ReceptionistStatus.VERIFIED) {
                throw new AppException(ErrorCode.RECEPTIONIST_ALREADY_VERIFIED);
            }
            if (receptionist.getStatus() == ReceptionistStatus.APPROVED) {
                throw new AppException(ErrorCode.RECEPTIONIST_ALREADY_APPROVED);
            }

            throw new AppException(ErrorCode.INVALID_APPROVE_STEP);
        }

        // MANAGER XỬ LÝ
        if (isManager) {
            // Chỉ được approve khi đang VERIFIED
            if (receptionist.getStatus() == ReceptionistStatus.VERIFIED) {
                // Kiểm tra manager có quản lý bệnh viện không
                Hospital managerHospital = hospitalRepository.findByManagerId(currentUserId)
                        .orElseThrow(() -> new AppException(ErrorCode.MANAGER_NO_HOSPITAL));

                if (receptionist.getHospital() == null || !receptionist.getHospital().getId().equals(managerHospital.getId())) {
                    throw new AppException(ErrorCode.NOT_HOSPITAL_MANAGER);
                }

                ReceptionistStatus oldStatus = receptionist.getStatus();
                receptionist.setStatus(ReceptionistStatus.APPROVED);
                receptionistRepository.save(receptionist);

                // Cập nhật role user thành RECEPTIONIST
                User user = receptionist.getUser();
//                user.setRole(UserRole.RECEPTIONIST);
                userRoleService.assignRole(user, UserRole.RECEPTIONIST);
                userRepository.save(user);

                // Ghi history APPROVE
                receptionistAuditLogService.logApplication(
                        receptionist.getId(),
                        ReceptionistApplicationStatus.APPROVE,
                        oldStatus,
                        ReceptionistStatus.APPROVED,
                        null,
                        null,
                        "Manager tiếp nhận lễ tân vào bệnh viện",
                        httpRequest
                );

                // Gửi email duyệt
                mailService.sendProfileApprovalEmail(
                        user,
                        receptionist.getReceptionistCode(),
                        receptionist.getHospital().getName(),
                        "lễ tân",
                        "/receptionist/dashboard"
                );
                log.info("==> [APPROVE] Manager đã duyệt lễ tân {} từ VERIFIED → APPROVED", receptionistId);
                return;
            }

            // Nếu đang PENDING → chưa qua vòng Admin
            if (receptionist.getStatus() == ReceptionistStatus.PENDING) {
                throw new AppException(ErrorCode.RECEPTIONIST_NOT_VERIFIED_YET);
            }

            // Nếu đã APPROVED → báo lỗi
            if (receptionist.getStatus() == ReceptionistStatus.APPROVED) {
                throw new AppException(ErrorCode.RECEPTIONIST_ALREADY_APPROVED);
            }

            throw new AppException(ErrorCode.INVALID_APPROVE_STEP);
        }

        throw new AppException(ErrorCode.FORBIDDEN);
    }
}