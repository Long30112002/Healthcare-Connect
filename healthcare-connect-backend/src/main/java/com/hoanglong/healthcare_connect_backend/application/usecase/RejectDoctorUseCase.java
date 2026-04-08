package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.application.dto.RejectDoctorRequest;
import com.hoanglong.healthcare_connect_backend.application.service.ApplyDoctorHistoryService;
import com.hoanglong.healthcare_connect_backend.application.service.MailService;
import com.hoanglong.healthcare_connect_backend.core.constant.DoctorHistoryAction;
import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.RejectionReason;
import com.hoanglong.healthcare_connect_backend.core.entity.Doctor;
import com.hoanglong.healthcare_connect_backend.core.entity.DoctorHistory;
import com.hoanglong.healthcare_connect_backend.core.entity.Hospital;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.core.repository.IDoctorHistoryRepository;
import com.hoanglong.healthcare_connect_backend.core.repository.IDoctorRepository;
import com.hoanglong.healthcare_connect_backend.core.repository.IHospitalRepository;
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
public class RejectDoctorUseCase {
    private final IDoctorRepository doctorRepository;
    private final IHospitalRepository hospitalRepository;
    private final MailService mailService;
    private final ApplyDoctorHistoryService applyDoctorHistoryService;

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSPITAL_MANAGER')")
    public void execute(UUID doctorId, RejectDoctorRequest request, HttpServletRequest httpRequest) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));

        boolean isAdmin = SecurityUtils.hasRole("ROLE_ADMIN");
        boolean isManager = SecurityUtils.hasRole("ROLE_HOSPITAL_MANAGER");
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        // KIỂM TRA ĐÃ REJECT CHƯA
        if (doctor.getStatus() == DoctorStatus.REJECTED) {
            throw new AppException(ErrorCode.DOCTOR_ALREADY_REJECTED);
        }

        // KIỂM TRA ĐÃ APPROVED CHƯA
        if (doctor.getStatus() == DoctorStatus.APPROVED) {
            throw new AppException(ErrorCode.DOCTOR_ALREADY_APPROVED);
        }

        String oldStatus = doctor.getStatus().name();
        String reasonDetail = (request.getReasonCode() == RejectionReason.OTHER)
                ? request.getNote()
                : request.getReasonCode().getMessage();

        // ADMIN XỬ LÝ
        if (isAdmin) {
            // Chỉ được reject khi đang PENDING
            if (doctor.getStatus() == DoctorStatus.PENDING) {
                doctor.setRejectionReason(request.getReasonCode());
                doctor.setRejectionNote(reasonDetail);
                doctor.setStatus(DoctorStatus.REJECTED);
                doctorRepository.save(doctor);

                // Ghi history REJECT
                applyDoctorHistoryService.recordDoctorRejection(
                        doctor.getId(), currentUserId, "ADMIN", oldStatus,
                        request.getReasonCode().name(), reasonDetail,
                        "Admin từ chối hồ sơ", httpRequest);

                mailService.sendDoctorRejectionEmail(doctor.getUser(), reasonDetail);
                log.info("==> [REJECT] Admin đã từ chối bác sĩ {} từ PENDING → REJECTED", doctorId);
                return;
            }

            // Nếu đã VERIFIED → admin không nên reject nữa (để manager quyết định)
            if (doctor.getStatus() == DoctorStatus.VERIFIED) {
                throw new AppException(ErrorCode.CANNOT_REJECT_VERIFIED);
            }

            throw new AppException(ErrorCode.INVALID_REJECT_STEP);
        }

        // MANAGER XỬ LÝ
        if (isManager) {
            // Chỉ được reject khi đang VERIFIED
            if (doctor.getStatus() == DoctorStatus.VERIFIED) {
                // Kiểm tra manager có quản lý bệnh viện không
                Hospital managerHospital = hospitalRepository.findByManagerId(currentUserId)
                        .orElseThrow(() -> new AppException(ErrorCode.MANAGER_NO_HOSPITAL));

                // Kiểm tra bác sĩ có thuộc bệnh viện của manager không
                if (doctor.getHospital() == null || !doctor.getHospital().getId().equals(managerHospital.getId())) {
                    throw new AppException(ErrorCode.NOT_HOSPITAL_MANAGER);
                }

                doctor.setRejectionReason(request.getReasonCode());
                doctor.setRejectionNote(reasonDetail);
                doctor.setStatus(DoctorStatus.REJECTED);
                doctorRepository.save(doctor);

                // Ghi history REJECT
                applyDoctorHistoryService.recordDoctorRejection(
                        doctor.getId(), currentUserId, "HOSPITAL_MANAGER", oldStatus,
                        request.getReasonCode().name(), reasonDetail,
                        "Manager từ chối tiếp nhận bác sĩ", httpRequest);

                mailService.sendDoctorRejectionEmail(doctor.getUser(), reasonDetail);
                log.info("==> [REJECT] Manager đã từ chối bác sĩ {} từ VERIFIED → REJECTED", doctorId);
                return;
            }

            // Nếu đang PENDING → chưa qua vòng Admin
            if (doctor.getStatus() == DoctorStatus.PENDING) {
                throw new AppException(ErrorCode.DOCTOR_NOT_VERIFIED_YET);
            }

            throw new AppException(ErrorCode.INVALID_REJECT_STEP);
        }

        throw new AppException(ErrorCode.FORBIDDEN);
    }

}