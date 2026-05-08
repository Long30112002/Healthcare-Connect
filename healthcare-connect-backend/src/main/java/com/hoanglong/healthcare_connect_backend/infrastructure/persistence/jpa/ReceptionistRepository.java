package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;
import com.hoanglong.healthcare_connect_backend.core.constant.ReceptionistStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Receptionist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
public interface ReceptionistRepository extends JpaRepository<Receptionist, UUID> {

    Optional<Receptionist> findByUserId(UUID userId);

    Optional<Receptionist> findByReceptionistCode(String receptionistCode);

    List<Receptionist> findByHospitalId(UUID hospitalId);

    List<Receptionist> findByStatus(ReceptionistStatus status);

    List<Receptionist> findByHospitalIdAndStatus(UUID hospitalId, ReceptionistStatus status);

    boolean existsByUserId(UUID userId);

    boolean existsByReceptionistCode(String receptionistCode);

    Page<Receptionist> findAll(Pageable pageable);

    Page<Receptionist> findByStatus(ReceptionistStatus status, Pageable pageable);

    Page<Receptionist> findByHospitalId(UUID hospitalId, Pageable pageable);

    Page<Receptionist> findByHospitalIdAndStatus(UUID hospitalId, ReceptionistStatus status, Pageable pageable);

    long countByHospitalId(UUID hospitalId);

    @Query("SELECT COUNT(r) FROM Receptionist r WHERE r.hospital.id = :hospitalId AND r.createdAt BETWEEN :start AND :end")
    long countByHospitalIdAndCreatedAtBetween(@Param("hospitalId") UUID hospitalId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT r FROM Receptionist r WHERE " +
            "LOWER(r.user.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(r.receptionistCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(r.user.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Receptionist> search(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT r FROM Receptionist r WHERE r.hospital.id = :hospitalId AND " +
            "(LOWER(r.user.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(r.receptionistCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(r.user.email) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Receptionist> searchByHospital(@Param("hospitalId") UUID hospitalId,
            @Param("keyword") String keyword,
            Pageable pageable);

}
