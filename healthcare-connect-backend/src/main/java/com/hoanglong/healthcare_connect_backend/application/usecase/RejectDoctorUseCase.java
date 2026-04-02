package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.application.dto.RejectDoctorRequest;
import com.hoanglong.healthcare_connect_backend.application.service.MailService;
import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.RejectionReason;
import com.hoanglong.healthcare_connect_backend.core.entity.Doctor;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.core.repository.IDoctorRepository;
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
public class RejectDoctorUseCase {
    private final IDoctorRepository doctorRepository;
    private final MailService mailService;

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSPITAL_MANAGER')")
    public void execute(UUID doctorId, RejectDoctorRequest request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 1. Kiểm tra quyền hạn (Admin hoặc Manager của bệnh viện đó)
        checkPermission(doctor);

        // 2. Cập nhật trạng thái từ chối
        doctor.setStatus(DoctorStatus.REJECTED);
        doctorRepository.save(doctor);

        // 3. Xử lý logic lấy lý do từ chối
        String reasonDetail = (request.getReasonCode() == RejectionReason.OTHER)
                ? request.getNote()
                : request.getReasonCode().getMessage();

        // 4. Gửi mail thông báo qua hàng chờ
        mailService.sendDoctorRejectionEmail(doctor.getUser(), reasonDetail);

        log.info("==> [REJECT] Bác sĩ {} đã bị từ chối. Lý do: {}", doctorId, reasonDetail);
    }

    private void checkPermission(Doctor doctor) {
        boolean isAdmin = SecurityUtils.hasRole("ROLE_ADMIN");
        if (!isAdmin) {
            UUID currentManagerId = SecurityUtils.getCurrentUserId();
            if (!doctor.getHospital().getManager().getId().equals(currentManagerId)) {
                throw new AppException(ErrorCode.FORBIDDEN);
            }
        }
    }
}