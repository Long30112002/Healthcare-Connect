package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;

import com.hoanglong.healthcare_connect_backend.core.constant.HospitalStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Doctor;
import com.hoanglong.healthcare_connect_backend.core.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface JpaHospitalRepository extends JpaRepository<Hospital, UUID> {
    Optional<Hospital> findByManagerId(UUID managerId);
    boolean existsByName(String name);

    Optional<Hospital> findByTempManagerEmailAndStatus (String email, HospitalStatus status);
}
