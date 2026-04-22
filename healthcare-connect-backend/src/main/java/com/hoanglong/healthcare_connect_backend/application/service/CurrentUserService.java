package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.hospital.HospitalResponse;
import com.hoanglong.healthcare_connect_backend.core.entity.Hospital;
import com.hoanglong.healthcare_connect_backend.core.entity.Receptionist;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.entity.UserRole;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.ReceptionistRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.UserRepository;
import com.hoanglong.healthcare_connect_backend.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CurrentUserService
{
    private final ReceptionistRepository receptionistRepository;
    private final UserRepository userRepository;

    public UUID getCurrentReceptionistHospitalId() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        return receptionistRepository.findByUserId(currentUserId)
                .map(r -> r.getHospital().getId())
                .orElseThrow(() -> new AppException(ErrorCode.RECEPTIONIST_NO_HOSPITAL));
    }

    public Receptionist getCurrentReceptionist() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        return receptionistRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.RECEPTIONIST_NOT_FOUND));
    }

    public HospitalResponse getCurrentHospital() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (user.getRole() != UserRole.RECEPTIONIST) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Lấy hospital từ receptionist
        Receptionist receptionist = receptionistRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.RECEPTIONIST_NOT_FOUND));

        Hospital hospital = receptionist.getHospital();

        if (hospital == null) {
            throw new AppException(ErrorCode.RECEPTIONIST_NO_HOSPITAL);
        }

        return HospitalResponse.builder()
                .id(hospital.getId())
                .name(hospital.getName())
                .address(hospital.getAddress())
                .description(hospital.getDescription())
                .imageUrl(hospital.getImageUrl())
                .createdAt(hospital.getCreatedAt())
                .updatedAt(hospital.getUpdatedAt())
                .build();
    }
}
    