package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.application.service.MailService;
import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Doctor;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.entity.UserRole;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.core.repository.IDoctorRepository;
import com.hoanglong.healthcare_connect_backend.core.repository.IUserRepository;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApproveDoctorUseCase {
    private final IDoctorRepository doctorRepository;
    private final IUserRepository userRepository;
    private final MailService mailService; // Sử dụng MailService duy nhất

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSPITAL_MANAGER')")
    public void execute(UUID doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        boolean isAdmin = SecurityUtils.hasRole("ROLE_ADMIN");
        boolean isManager = SecurityUtils.hasRole("ROLE_HOSPITAL_MANAGER");

        // 1: ADMIN DUYỆT (Bước 1: Verify hồ sơ)
        if (isAdmin && doctor.getStatus() == DoctorStatus.PENDING) {
            doctor.setStatus(DoctorStatus.VERIFIED);
        }
        // 2: MANAGER DUYỆT (Bước 2: Chấp nhận vào bệnh viện - Chốt Role DOCTOR)
        else if (isManager && doctor.getStatus() == DoctorStatus.VERIFIED) {
            UUID currentManagerId = SecurityUtils.getCurrentUserId();

            // Kiểm tra xem bác sĩ có thuộc BV của Manager này không
            if (!doctor.getHospital().getManager().getId().equals(currentManagerId)) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }

            doctor.setStatus(DoctorStatus.APPROVED);

            // Nâng cấp Role cho User
            User user = doctor.getUser();
            user.setRole(UserRole.DOCTOR);
            userRepository.save(user);

            // Gửi mail chúc mừng qua Service
            mailService.sendDoctorApprovalEmail(user);
        } else {
            throw new AppException(ErrorCode.INVALID_APPROVE_STEP);
        }

        doctorRepository.save(doctor);
        log.info("==> [APPROVE] Bác sĩ {} đã được duyệt thành công sang trạng thái {}", doctorId, doctor.getStatus());
    }
}