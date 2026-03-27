package com.hoanglong.healthcare_connect_backend.core.repository;

import com.hoanglong.healthcare_connect_backend.core.entity.InvalidatedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Date;

@Repository
public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, String>
{
    // JpaRepository đã có sẵn các hàm:
    // .existsById(String id) -> Dùng để check xem token có trong Blacklist không
    // .save(entity) -> Dùng để lưu token khi User bấm Logout
    // .deleteById(id) -> Dùng để dọn dẹp token hết hạn
    void deleteAllByExpiryTimeBefore(LocalDateTime expiryTime);
}