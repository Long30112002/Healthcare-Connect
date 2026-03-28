package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;

import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JpaDoctorRepository extends JpaRepository<Doctor, UUID>
{
    boolean existsByUserId(UUID userId);
    List<Doctor> findAllByStatus(DoctorStatus status);
    Optional<Doctor> findByUserId(UUID userId);
    
}
