package com.hoanglong.healthcare_connect_backend.core.repository;

import com.hoanglong.healthcare_connect_backend.core.entity.Specialty;

import java.util.Optional;
import java.util.UUID;

public interface ISpecialtyRepository {
    Specialty save(Specialty specialty);
    Optional<Specialty> findById(UUID id);
    boolean existsByName(String name);
}