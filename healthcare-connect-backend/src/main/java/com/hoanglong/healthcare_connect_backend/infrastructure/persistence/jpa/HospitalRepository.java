package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;

import com.hoanglong.healthcare_connect_backend.application.dto.statistics.admin.TopHospitalResponse;
import com.hoanglong.healthcare_connect_backend.core.constant.HospitalStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Hospital;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HospitalRepository extends JpaRepository<Hospital, UUID> {
    Optional<Hospital> findByManagerId(UUID managerId);
    boolean existsByName(String name);
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    Optional<Hospital> findByTempManagerEmailAndStatus (String email, HospitalStatus status);

    @Modifying
    @Transactional
    @Query("DELETE FROM Hospital h WHERE h.status = :status AND h.tokenExpiry < :now")
    void deleteAllByStatusAndTokenExpiryBefore(
            @Param("status") HospitalStatus status,
            @Param("now") LocalDateTime now
    );

    boolean existsByManagerId(UUID managerId);

    @Query(value = "SELECT h.id, h.name, h.address, " +
            "COUNT(DISTINCT d.id) as doctor_count, " +
            "COUNT(DISTINCT a.id) as booking_count, " +
            "COALESCE(SUM(CASE WHEN a.is_paid = true THEN s.price ELSE 0 END), 0) as revenue " +
            "FROM hospitals h " +
            "LEFT JOIN doctors d ON d.hospital_id = h.id " +
            "LEFT JOIN schedules s ON s.doctor_id = d.id " +
            "LEFT JOIN appointments a ON a.schedule_id = s.id " +
            "WHERE h.status = 'ACTIVE' " +
            "GROUP BY h.id " +
            "ORDER BY revenue DESC " +
            "LIMIT :limit",
            nativeQuery = true)
    List<Object[]> findTopHospitalsRaw(@Param("limit") int limit);

    @Query("SELECT h FROM Hospital h WHERE " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(h.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(h.address) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Hospital> findAllWithFilters(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM Doctor d WHERE d.hospital.id = :hospitalId")
    boolean hasDoctors(@Param("hospitalId") UUID hospitalId);

    Optional<Hospital> findByInvitationToken(String token);

    Optional<Hospital> findByTempManagerEmail(String email);
}
