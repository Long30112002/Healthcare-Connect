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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RejectDoctorUseCase {
    private final IDoctorRepository doctorRepository;
    private final MailService emailService;

    @Transactional
    @PreAuthorize("hasRole('ADMIN') or hasRole('HOSPITAL_MANAGER')")
    public void execute(UUID doctorId, RejectDoctorRequest request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));

        // 1. Kiểm tra quyền (Security Check)
        checkPermission(doctor);

        // 2. Cập nhật DB
        doctor.setStatus(DoctorStatus.REJECTED);
        doctor.setRejectionReason(request.getReasonCode());
        doctor.setRejectionNote(request.getNote());
        doctorRepository.save(doctor);

        // 3. Gửi Mail thông báo
        this.sendRejectionEmail(doctor, request);
    }

    private void checkPermission(Doctor doctor) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        // Nếu là Manager, phải check xem bác sĩ này có thuộc bệnh viện mình quản lý không
        if (!isAdmin) {
            UUID currentManagerId = SecurityUtils.getCurrentUserId();
            if (!doctor.getHospital().getManager().getId().equals(currentManagerId)) {
                throw new AppException(ErrorCode.FORBIDDEN);
            }
        }
    }

    private void sendRejectionEmail(Doctor doctor, RejectDoctorRequest request) {
        Map<String, Object> templateModel = new HashMap<>();
        templateModel.put("doctorName", doctor.getUser().getFullName());

        // Ưu tiên lấy message từ Enum, nếu là OTHER thì lấy note thủ công
        String reasonDetail = (request.getReasonCode() == RejectionReason.OTHER)
                ? request.getNote()
                : request.getReasonCode().getMessage();

        templateModel.put("reason", reasonDetail);

        emailService.sendEmail(
                doctor.getUser().getEmail(),
                "Thông báo kết quả hồ sơ Bác sĩ - Healthcare Connect",
                "doctor-rejection-template",
                templateModel
        );
    }
}