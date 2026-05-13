package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.hospital.HospitalResponse;
import com.hoanglong.healthcare_connect_backend.core.entity.Doctor;
import com.hoanglong.healthcare_connect_backend.core.entity.Hospital;
import com.hoanglong.healthcare_connect_backend.core.entity.Receptionist;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.DoctorRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.HospitalRepository;
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
    private final DoctorRepository doctorRepository;
    private final HospitalRepository hospitalRepository;

    public UUID getCurrentUserId() {
        return SecurityUtils.getCurrentUserId();
    }

    public UUID getCurrentReceptionistHospitalId() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        return receptionistRepository.findByUserId(currentUserId)
                .map(r -> r.getHospital().getId())
                .orElseThrow(() -> new AppException(ErrorCode.RECEPTIONIST_NO_HOSPITAL));
    }

    public Doctor getCurrentDoctor() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        return doctorRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));
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

        Hospital hospital = null;

        switch (user.getRole()) {
            case RECEPTIONIST -> {
                Receptionist receptionist = receptionistRepository.findByUserId(currentUserId)
                        .orElseThrow(() -> new AppException(ErrorCode.RECEPTIONIST_NOT_FOUND));
                hospital = receptionist.getHospital();
            }
            case DOCTOR -> {
                var doctor = doctorRepository.findByUserId(currentUserId)
                        .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));
                hospital = doctor.getHospital();
            }
            case HOSPITAL_MANAGER -> {
                hospital = hospitalRepository.findByManagerId(currentUserId)
                        .orElseThrow(() -> new AppException(ErrorCode.MANAGER_NO_HOSPITAL));
            }
            case ADMIN, PATIENT -> {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
        }

        if (hospital == null) {
            throw new AppException(ErrorCode.HOSPITAL_NOT_FOUND);
        }

        return HospitalResponse.builder()
                .id(hospital.getId())
                .name(hospital.getName())
                .address(hospital.getAddress())
                .description(hospital.getDescription())
                .imageUrl(hospital.getImageUrl())
                .hotline(hospital.getHotline())
                .email(hospital.getEmail())
                .website(hospital.getWebsite())
                .createdAt(hospital.getCreatedAt())
                .updatedAt(hospital.getUpdatedAt())
                .build();
    }

    public UUID getCurrentHospitalId() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        switch (user.getRole()) {
            case RECEPTIONIST -> {
                return receptionistRepository.findByUserId(currentUserId)
                        .map(r -> r.getHospital().getId())
                        .orElseThrow(() -> new AppException(ErrorCode.RECEPTIONIST_NO_HOSPITAL));
            }
            case DOCTOR -> {
                return doctorRepository.findByUserId(currentUserId)
                        .map(d -> d.getHospital().getId())
                        .orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NO_HOSPITAL));
            }
            case HOSPITAL_MANAGER -> {
                return hospitalRepository.findByManagerId(currentUserId)
                        .map(Hospital::getId)
                        .orElseThrow(() -> new AppException(ErrorCode.MANAGER_NO_HOSPITAL));
            }
            case ADMIN, PATIENT -> {
                return null; 
            }
            default -> throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }
}
    