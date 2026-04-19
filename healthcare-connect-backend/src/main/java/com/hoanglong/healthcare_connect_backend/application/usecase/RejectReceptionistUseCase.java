package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.application.dto.RejectReceptionistRequest;
import com.hoanglong.healthcare_connect_backend.application.service.MailService;
import com.hoanglong.healthcare_connect_backend.application.service.ReceptionistAuditLogService;
import com.hoanglong.healthcare_connect_backend.core.constant.ReceptionistApplicationStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.ReceptionistStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.RejectionReason;
import com.hoanglong.healthcare_connect_backend.core.entity.Hospital;
import com.hoanglong.healthcare_connect_backend.core.entity.Receptionist;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.JpaHospitalRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.ReceptionistRepository;
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
public class RejectReceptionistUseCase {

    private final ReceptionistRepository receptionistRepository;
    private final JpaHospitalRepository hospitalRepository;
    private final MailService mailService;
    private final ReceptionistAuditLogService receptionistAuditLogService;

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSPITAL_MANAGER')")
    public void execute(UUID receptionistId, RejectReceptionistRequest request, HttpServletRequest httpRequest) {
        Receptionist receptionist = receptionistRepository.findById(receptionistId)
                .orElseThrow(() -> new AppException(ErrorCode.RECEPTIONIST_NOT_FOUND));

        boolean isAdmin = SecurityUtils.hasRole("ROLE_ADMIN");
        boolean isManager = SecurityUtils.hasRole("ROLE_HOSPITAL_MANAGER");
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        // KIỂM TRA ĐÃ REJECT CHƯA
        if (receptionist.getStatus() == ReceptionistStatus.REJECTED) {
            throw new AppException(ErrorCode.RECEPTIONIST_ALREADY_REJECTED);
        }

        // KIỂM TRA ĐÃ APPROVED CHƯA
        if (receptionist.getStatus() == ReceptionistStatus.APPROVED) {
            throw new AppException(ErrorCode.RECEPTIONIST_ALREADY_APPROVED);
        }

        ReceptionistStatus oldStatus = receptionist.getStatus();
        String reasonDetail = (request.getReasonCode() == RejectionReason.OTHER)
                ? request.getNote()
                : request.getReasonCode().getMessage();

        // ADMIN XỬ LÝ
        if (isAdmin) {
            // Chỉ được reject khi đang PENDING
            if (receptionist.getStatus() == ReceptionistStatus.PENDING) {
                receptionist.setRejectionReason(request.getReasonCode().name());
                receptionist.setRejectionNote(reasonDetail);
                receptionist.setStatus(ReceptionistStatus.REJECTED);
                receptionistRepository.save(receptionist);

                // Ghi history REJECT
                receptionistAuditLogService.logApplication(
                        receptionist.getId(),
                        ReceptionistApplicationStatus.REJECT,
                        oldStatus,
                        ReceptionistStatus.REJECTED,
                        request.getReasonCode().name(),
                        reasonDetail,
                        "Admin từ chối hồ sơ lễ tân",
                        httpRequest
                );

                // Gửi email từ chối
                mailService.sendProfileRejectionEmail(receptionist.getUser(), reasonDetail, "lễ tân");
                log.info("==> [REJECT] Admin đã từ chối lễ tân {} từ PENDING → REJECTED", receptionistId);
                return;
            }

            // Nếu đã VERIFIED → admin không nên reject nữa (để manager quyết định)
            if (receptionist.getStatus() == ReceptionistStatus.VERIFIED) {
                throw new AppException(ErrorCode.CANNOT_REJECT_VERIFIED);
            }

            throw new AppException(ErrorCode.INVALID_REJECT_STEP);
        }

        // MANAGER XỬ LÝ
        if (isManager) {
            // Chỉ được reject khi đang VERIFIED
            if (receptionist.getStatus() == ReceptionistStatus.VERIFIED) {
                // Kiểm tra manager có quản lý bệnh viện không
                Hospital managerHospital = hospitalRepository.findByManagerId(currentUserId)
                        .orElseThrow(() -> new AppException(ErrorCode.MANAGER_NO_HOSPITAL));

                // Kiểm tra lễ tân có thuộc bệnh viện của manager không
                if (receptionist.getHospital() == null || !receptionist.getHospital().getId().equals(managerHospital.getId())) {
                    throw new AppException(ErrorCode.NOT_HOSPITAL_MANAGER);
                }

                receptionist.setRejectionReason(request.getReasonCode().name());
                receptionist.setRejectionNote(reasonDetail);
                receptionist.setStatus(ReceptionistStatus.REJECTED);
                receptionistRepository.save(receptionist);

                // Ghi history REJECT
                receptionistAuditLogService.logApplication(
                        receptionist.getId(),
                        ReceptionistApplicationStatus.REJECT,
                        oldStatus,
                        ReceptionistStatus.REJECTED,
                        request.getReasonCode().name(),
                        reasonDetail,
                        "Manager từ chối tiếp nhận lễ tân",
                        httpRequest
                );

                // Gửi email từ chối
                mailService.sendProfileRejectionEmail(receptionist.getUser(), reasonDetail, "lễ tân");
                log.info("==> [REJECT] Manager đã từ chối lễ tân {} từ VERIFIED → REJECTED", receptionistId);
                return;
            }

            // Nếu đang PENDING → chưa qua vòng Admin
            if (receptionist.getStatus() == ReceptionistStatus.PENDING) {
                throw new AppException(ErrorCode.RECEPTIONIST_NOT_VERIFIED_YET);
            }

            throw new AppException(ErrorCode.INVALID_REJECT_STEP);
        }

        throw new AppException(ErrorCode.FORBIDDEN);
    }
}