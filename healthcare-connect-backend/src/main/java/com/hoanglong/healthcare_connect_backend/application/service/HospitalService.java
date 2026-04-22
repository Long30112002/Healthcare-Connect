package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.HospitalRequest;
import com.hoanglong.healthcare_connect_backend.application.dto.HospitalResponse;
import com.hoanglong.healthcare_connect_backend.application.mapper.HospitalMapper;
import com.hoanglong.healthcare_connect_backend.core.constant.HospitalStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Hospital;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.entity.UserRole;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.HospitalRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HospitalService {
    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;
    private final HospitalMapper hospitalMapper;
    private final MailService mailService;

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public HospitalResponse createHospital(HospitalRequest request) {
        // 1. Kiểm tra xem Bệnh viện đã tồn tại tên này chưa (Dùng Repository bạn vừa viết)
        if (hospitalRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.HOSPITAL_ALREADY_EXISTS);
        }

        // 2. Tìm user theo email dự định mời
        User user = userRepository.findByEmail(request.getManagerEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 3. Kiểm tra user đã verify email chưa
        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new AppException(ErrorCode.USER_NOT_VERIFIED);
        }

        // 4. Không mời Admin hoặc Doctor làm Manager
        if (user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.DOCTOR) {
            throw new AppException(ErrorCode.INVALID_ROLE_FOR_MANAGER);
        }

        // 5. Kiểm tra user đã là Manager của bệnh viện khác chưa
        if (user.getRole() == UserRole.HOSPITAL_MANAGER) {
            boolean alreadyManager = hospitalRepository.existsByManagerId(user.getId());
            if (alreadyManager) {
                throw new AppException(ErrorCode.USER_ALREADY_MANAGER);
            }
        }

        // 6. Map request sang Entity và thiết lập các thông số lời mời
        String token = UUID.randomUUID().toString();
        Hospital hospital = hospitalMapper.swallowRequestToHospital(request);

        hospital.setStatus(HospitalStatus.PENDING_CONFIRMATION);
        hospital.setInvitationToken(token);
        hospital.setTokenExpiry(LocalDateTime.now().plusHours(24));
        hospital.setTempManagerEmail(request.getManagerEmail());
        hospital.setManager(null);

        Hospital savedHospital = hospitalRepository.save(hospital);

        // 5. Gửi mail mời xác nhận thông qua RabbitMQ
        mailService.sendManagerInvitation(user, savedHospital, token);

        return hospitalMapper.toHospitalResponse(savedHospital);
    }

    public HospitalResponse getHospitalById(UUID id) {
        return hospitalRepository.findById(id)
                .map(hospitalMapper::toHospitalResponse)
                .orElseThrow(() -> new AppException(ErrorCode.HOSPITAL_NOT_FOUND));
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN') or (hasRole('HOSPITAL_MANAGER') and @securityService.isManagerOfHospital(#id))")
    public HospitalResponse updateHospital(@P("id") UUID id, HospitalRequest request) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.HOSPITAL_NOT_FOUND));
        hospitalMapper.updateHospital(hospital, request);

        return hospitalMapper.toHospitalResponse(hospitalRepository.save(hospital));
    }

    public List<HospitalResponse> getAllHospitals() {
        return hospitalRepository.findAll().stream()
                .map(hospital -> HospitalResponse.builder()
                        .id(hospital.getId())
                        .name(hospital.getName())
                        .address(hospital.getAddress())
                        .description(hospital.getDescription())
                        .imageUrl(hospital.getImageUrl())
//                        .managerEmail(hospital.getTempManagerEmail())
                        .createdAt(hospital.getCreatedAt())
                        .updatedAt(hospital.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}