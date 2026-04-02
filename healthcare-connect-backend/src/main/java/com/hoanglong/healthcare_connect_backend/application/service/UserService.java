package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.UserRegistrationRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.UserResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.BaseMapper;
import com.hoanglong.healthcare_connect_backend.application.mapper.UserMapper;
import com.hoanglong.healthcare_connect_backend.core.constant.HospitalStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.core.repository.IHospitalRepository;
import com.hoanglong.healthcare_connect_backend.core.repository.IUserRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.JpaHospitalRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.JpaUserRepository;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserService extends BaseService<User, UserRegistrationRequest, UserResponse, UUID>
{

    private final IUserRepository userRepository;
    private final UserMapper userMapper;
    private final JpaUserRepository jpaUserRepository;
    private IHospitalRepository hospitalRepository;

    public UserService(IUserRepository userRepository, UserMapper userMapper, JpaUserRepository jpaUserRepository, IHospitalRepository hospitalRepository) {
        super(ErrorCode.USER_NOT_FOUND, ErrorCode.USER_EXISTED);
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.jpaUserRepository = jpaUserRepository;
        this.hospitalRepository = hospitalRepository;
    }

    // Bắt buộc Override các "đầu nối" cho BaseService
    @Override protected JpaRepository<User, UUID> getRepository() { return jpaUserRepository; }
    @Override protected BaseMapper<User, UserResponse> getMapper() { return userMapper; }

    @Override
    protected User mapToEntity(UserRegistrationRequest request) {
        return userMapper.toEntity(request);
    }

    public UserResponse getMyInfo() {
        // 1. Lấy email từ SecurityContext
        UUID userId = SecurityUtils.getCurrentUserId();

        // 2. Tìm User trong DB
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 3. Map sang Response cơ bản
        UserResponse response = userMapper.toUserResponse(user);

        // 4. KIỂM TRA LỜI MỜI ĐANG CHỜ (Anti-Miss Logic)
        if (hospitalRepository != null) {
            hospitalRepository.findByTempManagerEmailAndStatus(user.getEmail(), HospitalStatus.PENDING_CONFIRMATION)
                    .ifPresent(hospital -> {
                        response.setPendingInvitation(UserResponse.PendingInvitationDTO.builder()
                                .hospitalId(hospital.getId())
                                .hospitalName(hospital.getName())
                                .token(hospital.getInvitationToken())
                                .build());
                    });
        }
        return response;
    }
}
