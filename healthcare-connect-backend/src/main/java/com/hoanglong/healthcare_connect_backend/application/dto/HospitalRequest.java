package com.hoanglong.healthcare_connect_backend.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HospitalRequest {
    @NotBlank(message = "HOSPITAL_NAME_REQUIRED")
    @Size(min = 2, max = 255, message = "HOSPITAL_NAME_INVALID")
    String name;

    @NotBlank(message = "HOSPITAL_ADDRESS_REQUIRED")
    @Size(min = 5, max = 500, message = "HOSPITAL_ADDRESS_INVALID")
    String address;

    @Size(max = 2000, message = "DESCRIPTION_TOO_LONG")
    String description;

    @Size(max = 500, message = "IMAGE_URL_TOO_LONG")
    String imageUrl;

    @NotBlank(message = "MANAGER_EMAIL_REQUIRED")
    @Email(message = "EMAIL_INVALID")
    String managerEmail;
}
