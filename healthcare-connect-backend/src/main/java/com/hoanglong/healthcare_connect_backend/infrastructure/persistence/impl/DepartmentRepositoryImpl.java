package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.impl;

import com.hoanglong.healthcare_connect_backend.core.entity.Department;
import com.hoanglong.healthcare_connect_backend.core.repository.IDepartmentRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.JpaDepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DepartmentRepositoryImpl implements IDepartmentRepository
{
    private final JpaDepartmentRepository jpaRepository;

    @Override
    public Optional<Department> findById(UUID id) {
        return jpaRepository.findById(id);
    }

}