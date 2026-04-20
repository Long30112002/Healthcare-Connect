package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;

import com.hoanglong.healthcare_connect_backend.core.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
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
}