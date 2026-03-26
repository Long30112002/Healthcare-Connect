package com.hoanglong.healthcare_connect_backend.application.dto;

import lombok.Data;

@Data
public class UserRegistrationRequest
{
    private String fullName;
    private String email;
    private String password;
    private String role;
    private String phone;
}