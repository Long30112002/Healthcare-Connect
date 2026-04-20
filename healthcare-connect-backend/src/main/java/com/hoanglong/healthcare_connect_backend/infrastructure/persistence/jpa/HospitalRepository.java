package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;

import com.hoanglong.healthcare_connect_backend.core.constant.HospitalStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface HospitalRepository extends JpaRepository<Hospital, UUID> {
    Optional<Hospital> findByManagerId(UUID managerId);
    boolean existsByName(String name);

    Optional<Hospital> findByTempManagerEmailAndStatus (String email, HospitalStatus status);

    @Modifying
    @Transactional
    @Query("DELETE FROM Hospital h WHERE h.status = :status AND h.tokenExpiry < :now")
    void deleteAllByStatusAndTokenExpiryBefore(
            @Param("status") HospitalStatus status,
            @Param("now") LocalDateTime now
    );
    boolean existsByManagerId(UUID managerId);
}
