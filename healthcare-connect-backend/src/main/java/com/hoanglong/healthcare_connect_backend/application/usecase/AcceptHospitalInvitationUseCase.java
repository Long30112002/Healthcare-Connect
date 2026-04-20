package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.AcceptInvitationRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.UserResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.UserMapper;
import com.hoanglong.healthcare_connect_backend.core.constant.HospitalStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Hospital;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.entity.UserRole;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.HospitalRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.UserRepository;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AcceptHospitalInvitationUseCase {
    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Transactional
    public ApiResponse<UserResponse> execute(AcceptInvitationRequest request) {
        // 1. Tìm bệnh viện
        Hospital hospital = hospitalRepository.findById(request.getHospitalId())
                .orElseThrow(() -> new AppException(ErrorCode.HOSPITAL_NOT_FOUND));

        // 2. Kiểm tra Token
        if (hospital.getInvitationToken() == null || !hospital.getInvitationToken().equals(request.getToken())) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }

        if (hospital.getTokenExpiry().isBefore(LocalDateTime.now())) {
            hospital.setStatus(HospitalStatus.EXPIRED);
            hospitalRepository.save(hospital);
            throw new AppException(ErrorCode.TOKEN_EXPIRED);
        }

        // 3. Dùng ID thay Email để khớp với Token
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 4. Kiểm tra email user có khớp với email được mời không
        if (!user.getEmail().equals(hospital.getTempManagerEmail())) {
            throw new AppException(ErrorCode.INVITATION_EMAIL_MISMATCH);
        }

        // 4a. Kiểm tra user đã verify email chưa
        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new AppException(ErrorCode.USER_NOT_VERIFIED);
        }

        // 4b. Kiểm tra user không phải là ADMIN
        if (user.getRole() == UserRole.ADMIN) {
            throw new AppException(ErrorCode.ADMIN_CANNOT_BE_MANAGER);
        }

        // 4c. Kiểm tra user có ROLE manager của bệnh viện khác
        if (user.getRole() == UserRole.HOSPITAL_MANAGER) {
            boolean alreadyManager = hospitalRepository.existsByManagerId(user.getId());
            if (alreadyManager) {
                throw new AppException(ErrorCode.USER_ALREADY_MANAGER);
            }
        }

        // 5. Thực hiện nâng cấp Role và kích hoạt Bệnh viện
        user.setRole(UserRole.HOSPITAL_MANAGER);
        userRepository.save(user);

        hospital.setManager(user);
        hospital.setStatus(HospitalStatus.ACTIVE);
        hospital.setInvitationToken(null);
        hospital.setTokenExpiry(null);
        hospital.setTempManagerEmail(null);
        hospitalRepository.save(hospital);

        log.info("User {} đã chấp nhận quản lý bệnh viện {}", user.getEmail(), hospital.getName());

        return ApiResponse.<UserResponse>builder()
                .status("success")
                .code(200)
                .message("Chúc mừng! Bạn đã trở thành Quản lý của " + hospital.getName())
                .data(userMapper.toResponse(user))
                .build();
    }
}