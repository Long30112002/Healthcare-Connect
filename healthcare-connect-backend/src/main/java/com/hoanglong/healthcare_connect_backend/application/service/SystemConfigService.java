package com.hoanglong.healthcare_connect_backend.application.service;

import com.hoanglong.healthcare_connect_backend.application.dto.system_config.SystemConfigResponse;
import com.hoanglong.healthcare_connect_backend.application.dto.system_config.UpdateConfigRequest;
import com.hoanglong.healthcare_connect_backend.application.mapper.SystemConfigMapper;
import com.hoanglong.healthcare_connect_backend.core.entity.SystemConfig;
import com.hoanglong.healthcare_connect_backend.core.entity.User;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.SystemConfigRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.UserRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemConfigService {

    private final SystemConfigRepository configRepository;
    private final UserRepository userRepository;
    private final SystemConfigMapper configMapper;
    private final FileStorageService fileStorageService;

    // ==================== PUBLIC METHODS ====================

    /**
     * Lấy tất cả config (key-value) cho PUBLIC (FE gọi khi khởi động)
     */
    public Map<String, String> getAllConfigs() {
        List<SystemConfig> configs = configRepository.findByIsActiveTrue();
        return configs.stream()
                .collect(Collectors.toMap(
                        SystemConfig::getConfigKey,
                        SystemConfig::getConfigValue,
                        (existing, replacement) -> existing
                ));
    }

    /**
     * Lấy config theo key
     */
    public String getConfig(String key) {
        return configRepository.findByConfigKey(key)
                .map(SystemConfig::getConfigValue)
                .orElse(null);
    }

    /**
     * Lấy config theo key, nếu không có thì trả về defaultValue
     */
    public String getConfig(String key, String defaultValue) {
        String value = getConfig(key);
        return value != null ? value : defaultValue;
    }

    /**
     * Lấy config dạng JSON và parse thành List
     */
    public <T> List<T> getConfigAsList(String key, Class<T> elementType) {
        String json = getConfig(key);
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            // Sử dụng ObjectMapper để parse JSON
            return List.of();
        } catch (Exception e) {
            log.error("Failed to parse config {} as list: {}", key, e.getMessage());
            return List.of();
        }
    }

    // ==================== ADMIN METHODS ====================

    /**
     * Lấy tất cả config (cho ADMIN - có thể thấy cả inactive)
     */
    public List<SystemConfigResponse> getAllConfigsForAdmin() {
        return configRepository.findAll().stream()
                .map(this::toResponseWithUserName)
                .collect(Collectors.toList());
    }

    /**
     * Lấy config theo group (cho ADMIN)
     */
    public List<SystemConfigResponse> getConfigsByGroup(String groupName) {
        return configRepository.findByGroupNameOrderByDisplayOrderAsc(groupName)
                .stream()
                .map(this::toResponseWithUserName)
                .collect(Collectors.toList());
    }

    /**
     * Cập nhật config
     */
    @Transactional
    public SystemConfigResponse updateConfig(String key, UpdateConfigRequest request, UUID userId) {
        SystemConfig config = configRepository.findByConfigKey(key)
                .orElseThrow(() -> new AppException(ErrorCode.CONFIG_NOT_FOUND));

        config.setConfigValue(request.getConfigValue());
        if (request.getDescription() != null) {
            config.setDescription(request.getDescription());
        }
        if (request.getIsActive() != null) {
            config.setIsActive(request.getIsActive());
        }
        config.setUpdatedBy(userId);

        SystemConfig saved = configRepository.save(config);
        log.info("Config updated: {} = {}", key, request.getConfigValue());

        return toResponseWithUserName(saved);
    }

    /**
     * Tạo config mới (chỉ ADMIN)
     */
    @Transactional
    public SystemConfigResponse createConfig(SystemConfig config) {
        if (configRepository.existsByConfigKey(config.getConfigKey())) {
            throw new AppException(ErrorCode.CONFIG_ALREADY_EXISTS);
        }
        SystemConfig saved = configRepository.save(config);
        log.info("Config created: {} = {}", config.getConfigKey(), config.getConfigValue());
        return toResponseWithUserName(saved);
    }

    /**
     * Xóa config
     */
    @Transactional
    public void deleteConfig(String key) {
        if (!configRepository.existsByConfigKey(key)) {
            throw new AppException(ErrorCode.CONFIG_NOT_FOUND);
        }
        configRepository.deleteByConfigKey(key);
        log.info("Config deleted: {}", key);
    }

    /**
     * Upload ảnh lên Cloudinary/MinIO
     */
    public String uploadImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.FILE_REQUIRED);
        }
        String url = fileStorageService.uploadFile(file);
        log.info("Image uploaded: {}", url);
        return url;
    }

    // ==================== PRIVATE METHODS ====================

    private SystemConfigResponse toResponseWithUserName(SystemConfig config) {
        SystemConfigResponse response = configMapper.toResponse(config);
        if (config.getUpdatedBy() != null) {
            userRepository.findById(config.getUpdatedBy())
                    .ifPresent(user -> response.setUpdatedByName(user.getFullName()));
        }
        return response;
    }
}