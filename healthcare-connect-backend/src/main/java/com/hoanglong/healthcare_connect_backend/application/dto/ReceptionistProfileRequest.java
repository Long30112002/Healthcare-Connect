package com.hoanglong.healthcare_connect_backend.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReceptionistProfileRequest
{
    @NotNull(message = "HOSPITAL_ID_REQUIRED")
    UUID hospitalId;

    @NotNull(message = "REQUIRED_CV")
    MultipartFile cvFile;

    String note;
}
