package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;

import com.hoanglong.healthcare_connect_backend.core.entity.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SystemConfigRepository extends JpaRepository<SystemConfig, UUID>
{
    // Tìm theo key
    Optional<SystemConfig> findByConfigKey(String configKey);

    // Tìm theo group, sắp xếp theo display_order
    List<SystemConfig> findByGroupNameOrderByDisplayOrderAsc(String groupName);

    // Tìm tất cả config đang active
    List<SystemConfig> findByIsActiveTrue();

    // Tìm theo group và active
    List<SystemConfig> findByGroupNameAndIsActiveTrueOrderByDisplayOrderAsc(String groupName);

    // Kiểm tra tồn tại theo key
    boolean existsByConfigKey(String configKey);

    // Cập nhật giá trị config
    @Modifying
    @Transactional
    @Query("UPDATE SystemConfig c SET c.configValue = :value, c.updatedAt = CURRENT_TIMESTAMP, c.updatedBy = :userId WHERE c.configKey = :key")
    int updateConfigValue(@Param("key") String key, @Param("value") String value, @Param("userId") UUID userId);

    // Xóa theo key
    @Modifying
    @Transactional
    void deleteByConfigKey(String configKey);
}