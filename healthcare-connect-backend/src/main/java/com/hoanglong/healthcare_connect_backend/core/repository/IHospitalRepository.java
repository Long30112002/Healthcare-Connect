package com.hoanglong.healthcare_connect_backend.core.repository;

import com.hoanglong.healthcare_connect_backend.core.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IHospitalRepository {
    Optional<Hospital> findByManagerId(UUID managerId);
    boolean existsByName(String name);
    Hospital save(Hospital hospital);
    Optional<Hospital> findById(UUID id);
    List<Hospital> findAll();
}