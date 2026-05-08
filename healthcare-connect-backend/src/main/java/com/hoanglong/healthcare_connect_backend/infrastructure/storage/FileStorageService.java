package com.hoanglong.healthcare_connect_backend.infrastructure.storage;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String uploadFile(MultipartFile file);

    String getFileUrl(String filePath);

    void deleteFile(String filePath);
}