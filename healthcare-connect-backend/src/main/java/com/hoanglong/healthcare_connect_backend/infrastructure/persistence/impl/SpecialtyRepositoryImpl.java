package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.impl;

import com.hoanglong.healthcare_connect_backend.core.entity.Specialty;
import com.hoanglong.healthcare_connect_backend.core.repository.ISpecialtyRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.JpaSpecialtyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SpecialtyRepositoryImpl implements ISpecialtyRepository
{
    private final JpaSpecialtyRepository jpaRepository;

    @Override
    public Specialty save(Specialty specialty) {
        return jpaRepository.save(specialty);
    }

    @Override
    public Optional<Specialty> findById(UUID id) {
        return jpaRepository.findById(id);
    }

    @Override
    public boolean existsByName(String name) {
        return jpaRepository.existsByName(name);
    }
}