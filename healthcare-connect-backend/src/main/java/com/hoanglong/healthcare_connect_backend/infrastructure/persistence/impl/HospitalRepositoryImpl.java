package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.impl;

import com.hoanglong.healthcare_connect_backend.core.constant.HospitalStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Hospital;
import com.hoanglong.healthcare_connect_backend.core.repository.IHospitalRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.JpaHospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class HospitalRepositoryImpl implements IHospitalRepository {

    private final JpaHospitalRepository jpaHospitalRepository;

    @Override
    public Optional<Hospital> findByManagerId(UUID managerId) {
        return jpaHospitalRepository.findByManagerId(managerId);
    }

    @Override
    public boolean existsByName(String name) {
        return jpaHospitalRepository.existsByName(name);
    }

    @Override
    public Hospital save(Hospital hospital) {
        return jpaHospitalRepository.save(hospital);
    }

    @Override
    public Optional<Hospital> findById(UUID id) {
        return jpaHospitalRepository.findById(id);
    }

    @Override
    public List<Hospital> findAll() {
        return jpaHospitalRepository.findAll();
    }

    @Override
    public Optional<Hospital> findByTempManagerEmailAndStatus (String email, HospitalStatus status) {
        return jpaHospitalRepository.findByTempManagerEmailAndStatus (email, status);
    }
}