package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;

import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.constant.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    void deleteByEnabledFalseAndCreatedAtBefore(LocalDateTime threshold);

    Optional<User> findByVerificationCode(String code);

    @Modifying
    @Query("UPDATE User u SET u.enabled = true, u.verificationCode = null WHERE u.verificationCode = :code")
    int verifyUserByCode(@Param("code") String code);

    @Query(value = "SELECT EXTRACT(MONTH FROM created_at) as month, " +
            "EXTRACT(YEAR FROM created_at) as year, " +
            "COUNT(*) as count " +
            "FROM users " +
            "WHERE created_at >= :startDate " +
            "GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at) " +
            "ORDER BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)",
            nativeQuery = true)
    List<Object[]> getUserTrendRaw(@Param("startDate") LocalDateTime startDate);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT u FROM User u WHERE " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:role IS NULL OR u.role = :role) " +
            "AND (:enabled IS NULL OR u.enabled = :enabled)")  // ← Thêm
    Page<User> findAllWithFilters(@Param("keyword") String keyword,
            @Param("role") UserRole role,
            @Param("enabled") Boolean enabled,
            Pageable pageable);

    Optional<User> findById(UUID id);

    long countByRole(UserRole role);
}