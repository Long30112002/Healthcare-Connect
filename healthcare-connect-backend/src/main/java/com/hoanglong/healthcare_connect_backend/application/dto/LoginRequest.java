package com.hoanglong.healthcare_connect_backend.application.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}