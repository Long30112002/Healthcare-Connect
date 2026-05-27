package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.invitation.ApplicationResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.auth.UserRegistrationRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.user.ChangePasswordRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.user.UpdateProfileRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.user.UserResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.BaseMapper;
import com.hoanglong.healthcare_connect_backend.application.mapper.UserMapper;
import com.hoanglong.healthcare_connect_backend.core.constant.HospitalStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.RejectionReason;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.constant.UserRole;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.DoctorRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.HospitalRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.ReceptionistRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.UserRepository;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class UserService extends BaseService<User, UserRegistrationRequest, UserResponse, UUID>
{

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final HospitalRepository hospitalRepository;
    private final DoctorRepository doctorRepository;
    private final ReceptionistRepository receptionistRepository;

    public UserService(UserRepository userRepository, UserMapper userMapper, HospitalRepository hospitalRepository, DoctorRepository doctorRepository, ReceptionistRepository receptionistRepository) {
        super(ErrorCode.USER_NOT_FOUND, ErrorCode.USER_EXISTED);
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.hospitalRepository = hospitalRepository;
        this.doctorRepository = doctorRepository;
        this.receptionistRepository = receptionistRepository;
    }

    // Bắt buộc Override các "đầu nối" cho BaseService
    @Override protected JpaRepository<User, UUID> getRepository() { return userRepository; }
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
        UserResponse response = userMapper.toResponse(user);

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

    @Transactional
    public User updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());

        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

        // Kiểm tra mật khẩu cũ
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_OLD_PASSWORD);
        }

        // Mã hóa và lưu mật khẩu mới
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public List<ApplicationResponse> getMyApplications(UUID userId) {
        List<ApplicationResponse> applications = new ArrayList<>();

        // 1. Lấy hồ sơ bác sĩ
        doctorRepository.findByUserId(userId).ifPresent(doctor -> {
            applications.add(ApplicationResponse.builder()
                    .id(doctor.getId())
                    .type(UserRole.DOCTOR)
                    .hospitalName(doctor.getHospital() != null ? doctor.getHospital().getName() : null)
                    .hospitalId(doctor.getHospital() != null ? doctor.getHospital().getId() : null)
                    .status(doctor.getStatus().name())
                    .rejectionReason(doctor.getRejectionReason())
                    .rejectionNote(doctor.getRejectionNote())
                    .createdAt(doctor.getCreatedAt())
                    .updatedAt(doctor.getUpdatedAt())
                    .build());
        });

        // 2. Lấy hồ sơ lễ tân
        receptionistRepository.findByUserId(userId).ifPresent(receptionist -> {
            applications.add(ApplicationResponse.builder()
                    .id(receptionist.getId())
                    .type(UserRole.RECEPTIONIST)
                    .hospitalName(receptionist.getHospital() != null ? receptionist.getHospital().getName() : null)
                    .hospitalId(receptionist.getHospital() != null ? receptionist.getHospital().getId() : null)
                    .status(receptionist.getStatus().name())
                    .rejectionReason(receptionist.getRejectionReason() != null
                            ? RejectionReason.valueOf(receptionist.getRejectionReason())
                            : null)
                    .rejectionNote(receptionist.getRejectionNote())
                    .createdAt(receptionist.getCreatedAt())
                    .updatedAt(receptionist.getUpdatedAt())
                    .build());
        });

        return applications;
    }
}
