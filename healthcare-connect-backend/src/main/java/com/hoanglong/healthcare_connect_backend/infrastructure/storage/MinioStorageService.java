package com.hoanglong.healthcare_connect_backend.infrastructure.storage;

import com.hoanglong.healthcare_connect_backend.infrastructure.storage.config.MinioConfig;
import com.hoanglong.healthcare_connect_backend.infrastructure.storage.exception.StorageException;
import io.minio.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Primary
@Slf4j
public class MinioStorageService implements FileStorageService {

    private final MinioClient minioClient;
    private final MinioConfig minioConfig;

    @Override
    public String uploadFile(MultipartFile file) {
        try {
            String fileName = generateFileName(file.getOriginalFilename());

            // Kiểm tra bucket tồn tại, nếu chưa thì tạo
            boolean bucketExists = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(minioConfig.getBucketName()).build()
            );
            if (!bucketExists) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder().bucket(minioConfig.getBucketName()).build()
                );
                // Set bucket policy cho phép public read
                setPublicBucketPolicy();
            }

            // Upload file
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(fileName)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            // Trả về URL truy cập công khai
            return getFileUrl(fileName);

        } catch (Exception e) {
            log.error("Lỗi upload file lên MinIO: {}", e.getMessage());
            throw new StorageException("Upload file thất bại: " + e.getMessage(), e);
        }
    }

    @Override
    public String getFileUrl(String fileName) {
        // URL công khai (không cần signature)
        return String.format("%s/%s/%s",
                minioConfig.getEndpoint(),
                minioConfig.getBucketName(),
                fileName
        );
    }

    @Override
    public void deleteFile(String fileName) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(fileName)
                            .build()
            );
            log.info("Đã xóa file: {}", fileName);
        } catch (Exception e) {
            log.error("Lỗi xóa file: {}", e.getMessage());
            throw new StorageException("Xóa file thất bại: " + e.getMessage(), e);
        }
    }

    // Hỗ trợ tải file về (nếu cần)
    public InputStream downloadFile(String fileName) {
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(fileName)
                            .build()
            );
        } catch (Exception e) {
            throw new StorageException("Tải file thất bại: " + e.getMessage(), e);
        }
    }

    private String generateFileName(String originalFilename) {
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return "doctor_cvs/" + UUID.randomUUID().toString() + extension;
    }

    private void setPublicBucketPolicy() {
        try {
            String policy = String.format(
                    "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"AWS\":[\"*\"]},\"Action\":[\"s3:GetObject\"],\"Resource\":[\"arn:aws:s3:::%s/*\"]}]}",
                    minioConfig.getBucketName()
            );
            minioClient.setBucketPolicy(
                    SetBucketPolicyArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .config(policy)
                            .build()
            );
        } catch (Exception e) {
            log.warn("Không thể set bucket policy: {}", e.getMessage());
        }
    }
}