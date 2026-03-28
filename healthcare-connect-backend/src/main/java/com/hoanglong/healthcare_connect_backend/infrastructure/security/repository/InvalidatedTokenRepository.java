package com.hoanglong.healthcare_connect_backend.infrastructure.security.repository;

import com.hoanglong.healthcare_connect_backend.core.entity.InvalidatedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Repository
public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, String> {

    // Spring Data JPA sẽ tự hiểu câu Query này để dọn dẹp Token hết hạn
    @Modifying // Bắt buộc phải có khi dùng Delete/Update với @Query hoặc Method Name
    @Transactional
    void deleteAllByExpiryTimeBefore(LocalDateTime expiryTime);

    // Kiểm tra xem Token đã bị logout chưa
    boolean existsById(String id);
}