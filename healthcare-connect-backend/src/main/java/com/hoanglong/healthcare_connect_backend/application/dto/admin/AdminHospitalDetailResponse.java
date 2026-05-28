package com.hoanglong.healthcare_connect_backend.application.dto.admin;

import lombok.Builder;
import lombok.Data;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminHospitalDetailResponse {
    UUID id;
    String name;
    String address;
    String hotline;
    String email;
    String website;
    String description;
    String imageUrl;
    UUID managerId;
    String managerName;
    String managerEmail;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    long doctorCount;
}