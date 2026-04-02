package com.hoanglong.healthcare_connect_backend.core.repository;

import com.hoanglong.healthcare_connect_backend.core.constant.HospitalStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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
    @Query("SELECT h FROM Hospital h WHERE h.invitationToken IS NOT NULL " +
            "AND h.status = 'PENDING_CONFIRMATION' AND h.tempManagerEmail = :email")
    Optional<Hospital> findByTempManagerEmailAndStatus (String email, HospitalStatus status);
}