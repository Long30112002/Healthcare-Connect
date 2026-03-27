package com.hoanglong.healthcare_connect_backend.core.repository;

import com.hoanglong.healthcare_connect_backend.core.entity.Department;

import java.util.Optional;
import java.util.UUID;

public interface IDepartmentRepository {
    Optional<Department> findById(UUID id);
}