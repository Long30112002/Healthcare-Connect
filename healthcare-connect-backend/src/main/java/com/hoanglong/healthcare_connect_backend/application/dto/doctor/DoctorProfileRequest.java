package com.hoanglong.healthcare_connect_backend.application.dto.doctor;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorProfileRequest {
    @NotNull(message = "DEPARTMENT_ID_REQUIRED")
    UUID departmentId;

    @NotNull(message = "SPECIALTY_ID_REQUIRED")
    UUID specialtyId;

    @NotBlank(message = "DEGREE_REQUIRED")
    String degree;

    @Min(value = 0, message = "EXPERIENCE_YEARS_INVALID")
    Integer experienceYears;

    @NotBlank(message = "BIOGRAPHY_REQUIRED") 
    String biography;

    @NotNull(message = "REQUIRED_CV")
    MultipartFile cvFile;

    @NotNull(message = "HOSPITAL_ID_REQUIRED")
    UUID hospitalId;
}