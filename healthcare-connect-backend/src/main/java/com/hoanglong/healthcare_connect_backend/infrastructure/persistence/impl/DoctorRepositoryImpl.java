package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.impl;

import com.hoanglong.healthcare_connect_backend.application.dto.DoctorResponse;
import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Doctor;
import com.hoanglong.healthcare_connect_backend.core.repository.IDoctorRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.JpaDoctorRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.JpaUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
@Component
@RequiredArgsConstructor
public class DoctorRepositoryImpl implements IDoctorRepository
{
    private final JpaDoctorRepository jpaDoctorRepository   ;

    @Override
    public boolean existsByUserId(UUID userId) {
        return jpaDoctorRepository.existsByUserId(userId);
    }

    @Override
    public Doctor save(Doctor doctor) {
        return jpaDoctorRepository.save(doctor);
    }

    @Override
    public Optional<Doctor> findById(UUID id) {
        return jpaDoctorRepository.findById(id);

    }

    @Override
    public List<Doctor> findAllByStatus(DoctorStatus doctorStatus) {
        return jpaDoctorRepository.findAllByStatus(doctorStatus);
    }

    @Override
    public Optional<Doctor> findByUserId(UUID userId) {
        return jpaDoctorRepository.findByUserId(userId);
    }
}
