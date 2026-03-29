package com.hoanglong.healthcare_connect_backend.application.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorProfileRequest {
    @NotNull(message = "Vui lòng chọn khoa")
    UUID departmentId;

    @NotNull(message = "Vui lòng chọn chuyên khoa")
    UUID specialtyId;

    @NotBlank(message = "Vui lòng nhập học vị")
    String degree;

    @Min(value = 0, message = "Số năm kinh nghiệm không được âm")
    Integer experienceYears;

    @NotBlank(message = "Vui lòng nhập tiểu sử tóm tắt")
    String biography;

    @NotNull(message = "Vui lòng đính kèm file CV (PDF)")
    MultipartFile cvFile;
}