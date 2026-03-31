package com.hoanglong.healthcare_connect_backend.core.repository;

import com.hoanglong.healthcare_connect_backend.application.dto.DoctorResponse;
import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Doctor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IDoctorRepository
{
    boolean existsByUserId(UUID userId);

    Doctor save(Doctor doctor);

    Optional<Doctor> findById(UUID doctorId);

    List<Doctor> findAllByStatus(DoctorStatus doctorStatus);

    Optional<Doctor> findByUserId(UUID userId);

    List<Doctor> findAllByHospitalId(UUID hospitalId);
}
