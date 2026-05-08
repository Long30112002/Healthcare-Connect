package com.hoanglong.healthcare_connect_backend.infrastructure.storage;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service("cloudinaryStorageService")
@RequiredArgsConstructor
@Slf4j
public class CloudinaryStorageService implements FileStorageService {

    private final Cloudinary cloudinary;

    @Override
    public String uploadFile(MultipartFile file) {
        try {
            Map data = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", "auto",
                    "folder", "doctor_cvs"
            ));
            return data.get("secure_url").toString();
        } catch (IOException e) {
            throw new RuntimeException("Lỗi upload: " + e.getMessage());
        }
    }

    @Override
    public String getFileUrl(String filePath) {
        return filePath; // Cloudinary trả về URL sẵn
    }

    @Override
    public void deleteFile(String filePath) {
        try {
            cloudinary.uploader().destroy(filePath, ObjectUtils.emptyMap());
        } catch (Exception e) {
            log.error("Lỗi xóa file: {}", e.getMessage());
        }
    }
}