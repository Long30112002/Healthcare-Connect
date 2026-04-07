package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.application.service.ApplyDoctorHistoryService;
import com.hoanglong.healthcare_connect_backend.application.service.MailService;
import com.hoanglong.healthcare_connect_backend.core.constant.DoctorHistoryAction;
import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.*;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.core.repository.IDoctorHistoryRepository;
import com.hoanglong.healthcare_connect_backend.core.repository.IDoctorRepository;
import com.hoanglong.healthcare_connect_backend.core.repository.IHospitalRepository;
import com.hoanglong.healthcare_connect_backend.core.repository.IUserRepository;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApproveDoctorUseCase {
    private final IDoctorRepository doctorRepository;
    private final IUserRepository userRepository;
    private final IHospitalRepository hospitalRepository;
    private final ApplyDoctorHistoryService applyDoctorHistoryService;
    private final MailService mailService;

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSPITAL_MANAGER')")
    public void execute(UUID doctorId, HttpServletRequest httpRequest) {
        // 1. Tìm doctor
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));

        boolean isAdmin = SecurityUtils.hasRole("ROLE_ADMIN");
        boolean isManager = SecurityUtils.hasRole("ROLE_HOSPITAL_MANAGER");
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        // KIỂM TRA REJECTED TRƯỚC
        if (doctor.getStatus() == DoctorStatus.REJECTED) {
            throw new AppException(ErrorCode.DOCTOR_ALREADY_REJECTED);
        }

        // ADMIN XỬ LÝ
        if (isAdmin) {
            // Chỉ được approve khi đang PENDING
            if (doctor.getStatus() == DoctorStatus.PENDING) {
                String oldStatus = doctor.getStatus().name();
                doctor.setStatus(DoctorStatus.VERIFIED);
                doctorRepository.save(doctor);

                // Ghi history VERIFY
                applyDoctorHistoryService.recordDoctorHistory(doctor.getId(), currentUserId, "ADMIN", DoctorHistoryAction.VERIFY,
                        oldStatus, DoctorStatus.VERIFIED.name(), "Admin xác thực hồ sơ bác sĩ", httpRequest);

                mailService.sendDoctorVerifiedEmail(doctor.getUser(), doctor);
                log.info("==> [APPROVE] Admin đã duyệt bác sĩ {} từ PENDING → VERIFIED", doctorId);
                return;
            }

            // Nếu đã VERIFIED hoặc APPROVED → báo lỗi
            if (doctor.getStatus() == DoctorStatus.VERIFIED) {
                throw new AppException(ErrorCode.DOCTOR_ALREADY_VERIFIED);
            }
            if (doctor.getStatus() == DoctorStatus.APPROVED) {
                throw new AppException(ErrorCode.DOCTOR_ALREADY_APPROVED);
            }

            throw new AppException(ErrorCode.INVALID_APPROVE_STEP);
        }

        // MANAGER XỬ LÝ
        if (isManager) {
            // Chỉ được approve khi đang VERIFIED
            if (doctor.getStatus() == DoctorStatus.VERIFIED) {
                // Kiểm tra manager có quản lý bệnh viện không
                Hospital managerHospital = hospitalRepository.findByManagerId(currentUserId)
                        .orElseThrow(() -> new AppException(ErrorCode.MANAGER_NO_HOSPITAL));

                if (doctor.getHospital() == null || !doctor.getHospital().getId().equals(managerHospital.getId())) {
                    throw new AppException(ErrorCode.NOT_HOSPITAL_MANAGER);
                }

                String oldStatus = doctor.getStatus().name();
                doctor.setStatus(DoctorStatus.APPROVED);

                User user = doctor.getUser();
                user.setRole(UserRole.DOCTOR);
                userRepository.save(user);
                doctorRepository.save(doctor);

                // Ghi history APPROVE
                applyDoctorHistoryService.recordDoctorHistory(doctor.getId(), currentUserId, "HOSPITAL_MANAGER", DoctorHistoryAction.APPROVE,
                        oldStatus, DoctorStatus.APPROVED.name(), "Manager tiếp nhận bác sĩ vào bệnh viện", httpRequest);

                mailService.sendDoctorApprovalEmail(user, doctor);
                log.info("==> [APPROVE] Manager đã duyệt bác sĩ {} từ VERIFIED → APPROVED", doctorId);
                return;
            }

            // Nếu đang PENDING → chưa qua vòng Admin
            if (doctor.getStatus() == DoctorStatus.PENDING) {
                throw new AppException(ErrorCode.DOCTOR_NOT_VERIFIED_YET);
            }

            // Nếu đã APPROVED → báo lỗi
            if (doctor.getStatus() == DoctorStatus.APPROVED) {
                throw new AppException(ErrorCode.DOCTOR_ALREADY_APPROVED);
            }

            throw new AppException(ErrorCode.INVALID_APPROVE_STEP);
        }

        throw new AppException(ErrorCode.FORBIDDEN);
    }
}