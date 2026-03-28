package com.hoanglong.healthcare_connect_backend.core.repository;

import com.hoanglong.healthcare_connect_backend.core.entity.Specialty;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ISpecialtyRepository {
    Specialty save(Specialty specialty);

    Optional<Specialty> findById(UUID id);

    List<Specialty> findAll(); // Để lấy danh sách chuyên khoa (GET /api/specialties)

    boolean existsByName(String name);

    void deleteById(UUID id);
}