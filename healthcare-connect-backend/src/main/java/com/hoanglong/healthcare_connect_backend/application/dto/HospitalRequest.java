package com.hoanglong.healthcare_connect_backend.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HospitalRequest {
    @NotBlank(message = "Yêu cầu nhập vào tên bệnh viện")
    String name;
    @NotBlank(message = "Yêu cầu nhập địa chỉ")
    String address;
    String description;
    String imageUrl;
    @Email(message = "Email không hợp lệ")
    @NotBlank(message = "Email quản lý không được để trống")
    private String managerEmail;
}
