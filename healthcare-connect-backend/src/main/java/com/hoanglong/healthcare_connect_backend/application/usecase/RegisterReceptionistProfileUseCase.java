package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.application.dto.receptionist.ReceptionistProfileRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.receptionist.ReceptionistResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.ReceptionistMapper;
import com.hoanglong.healthcare_connect_backend.application.service.ReceptionistAuditLogService;
import com.hoanglong.healthcare_connect_backend.core.constant.HospitalStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.ReceptionistApplicationStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.ReceptionistStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Hospital;
import com.hoanglong.healthcare_connect_backend.core.entity.Receptionist;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.entity.UserRole;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.HospitalRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.ReceptionistRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.UserRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.storage.FileStorageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RegisterReceptionistProfileUseCase {

    private final ReceptionistRepository receptionistRepository;
    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final ReceptionistAuditLogService receptionistAuditLogService;
    private final ReceptionistMapper receptionistMapper;
    private final FileStorageService fileStorageService;

    @Transactional
    public ReceptionistResponse execute(UUID userId, ReceptionistProfileRequest request, HttpServletRequest httpRequest) {

        // 1. Validate CV
        validateCv(request);

        // 2. Check existing receptionist profile
        Optional<Receptionist> existingReceptionistOpt = receptionistRepository.findByUserId(userId);

        if (existingReceptionistOpt.isPresent()) {
            Receptionist existingReceptionist = existingReceptionistOpt.get();
            return handleExistingReceptionist(existingReceptionist, userId, request, httpRequest);
        }

        // 3. Validate and fetch entities
        User user = getUser(userId);
        validateUser(user);
        Hospital hospital = getHospital(request.getHospitalId());

        // 4. Upload CV
        String cvUrl = fileStorageService.uploadFile(request.getCvFile());

        // 5. Create new receptionist
        Receptionist receptionist = createNewReceptionist(user, hospital, request, cvUrl);
        Receptionist savedReceptionist = receptionistRepository.save(receptionist);

        // 6. Record history
        receptionistAuditLogService.logApplication(
                savedReceptionist.getId(),
                ReceptionistApplicationStatus.CREATE,
                null,
                ReceptionistStatus.PENDING,
                null,
                null,
                "Nộp hồ sơ đăng ký lễ tân lần đầu",
                httpRequest
        );

        log.info("==> [REGISTER] Receptionist {} registered for hospital {}", userId, hospital.getId());
        return receptionistMapper.toResponse(savedReceptionist);
    }

    private ReceptionistResponse handleExistingReceptionist(Receptionist receptionist, UUID userId,
            ReceptionistProfileRequest request,
            HttpServletRequest httpRequest) {

        // Không cho apply lại nếu đã approved
        if (receptionist.getStatus() == ReceptionistStatus.APPROVED) {
            throw new AppException(ErrorCode.RECEPTIONIST_ALREADY_APPROVED);
        }

        // Không cho apply nếu đang pending hoặc verified
        if (receptionist.getStatus() == ReceptionistStatus.PENDING ||
                receptionist.getStatus() == ReceptionistStatus.VERIFIED) {
            throw new AppException(ErrorCode.RECEPTIONIST_PROFILE_PENDING_OR_VERIFIED);
        }

        // Chỉ cho apply lại khi REJECTED
        if (receptionist.getStatus() == ReceptionistStatus.REJECTED) {
            return updateExistingReceptionist(receptionist, userId, request, httpRequest);
        }

        throw new AppException(ErrorCode.INVALID_RECEPTIONIST_STATUS);
    }

    private ReceptionistResponse updateExistingReceptionist(Receptionist oldReceptionist, UUID userId,
            ReceptionistProfileRequest request,
            HttpServletRequest httpRequest) {

        Hospital hospital = getHospital(request.getHospitalId());

        // Upload CV mới
        String cvUrl = fileStorageService.uploadFile(request.getCvFile());

        oldReceptionist.setHospital(hospital);
        oldReceptionist.setCvUrl(cvUrl);
        oldReceptionist.setStatus(ReceptionistStatus.PENDING);
        oldReceptionist.setRejectionReason(null);
        oldReceptionist.setRejectionNote(null);

        Receptionist savedReceptionist = receptionistRepository.save(oldReceptionist);

        receptionistAuditLogService.logApplication(
                savedReceptionist.getId(),
                ReceptionistApplicationStatus.REAPPLY,
                ReceptionistStatus.REJECTED,
                ReceptionistStatus.PENDING,
                null,
                null,
                "Gửi lại hồ sơ sau khi bị từ chối",
                httpRequest
        );

        return receptionistMapper.toResponse(savedReceptionist);
    }

    private Receptionist createNewReceptionist(User user, Hospital hospital,
            ReceptionistProfileRequest request, String cvUrl) {
        return Receptionist.builder()
                .user(user)
                .hospital(hospital)
                .receptionistCode(generateReceptionistCode())
                .status(ReceptionistStatus.PENDING)
                .cvUrl(cvUrl)
                .build();
    }

    private void validateCv(ReceptionistProfileRequest request) {
        if (request.getCvFile() == null || request.getCvFile().isEmpty()) {
            throw new AppException(ErrorCode.REQUIRED_CV);
        }
    }

    private void validateUser(User user) {
        // 1. Kiểm tra user đã xác thực email chưa
        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new AppException(ErrorCode.USER_NOT_VERIFIED);
        }

        // 2. Kiểm tra user không phải là ADMIN
        if (user.getRole() == UserRole.ADMIN) {
            throw new AppException(ErrorCode.ADMIN_CANNOT_BE_RECEPTIONIST);
        }

        // 3. KIỂM TRA USER ĐÃ CÓ ROLE ĐẶC BIỆT CHƯA
        if (user.getRole() == UserRole.DOCTOR) {
            throw new AppException(ErrorCode.DOCTOR_CANNOT_BE_RECEPTIONIST);
        }

        if (user.getRole() == UserRole.HOSPITAL_MANAGER) {
            throw new AppException(ErrorCode.MANAGER_CANNOT_BE_RECEPTIONIST);
        }

        if (user.getRole() == UserRole.RECEPTIONIST) {
            throw new AppException(ErrorCode.ALREADY_RECEPTIONIST);
        }
    }

    private User getUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private Hospital getHospital(UUID id) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.HOSPITAL_NOT_FOUND));

        if (hospital.getStatus() != HospitalStatus.ACTIVE) {
            throw new AppException(ErrorCode.HOSPITAL_NOT_ACTIVE);
        }
        return hospital;
    }

    private String generateReceptionistCode() {
        return "REC-" + LocalDate.now().getYear() + "-" +
                UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}