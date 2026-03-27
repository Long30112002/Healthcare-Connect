package com.hoanglong.healthcare_connect_backend.application.dto;

import com.hoanglong.healthcare_connect_backend.shared.util.ThrottlableRequest;
import lombok.Data;

@Data
public class LoginRequest implements ThrottlableRequest
{
    private String email;
    private String password;

    @Override
    public String getThrottleKey() {
        return this.email; // Muốn chặn theo Email khi Login spam
    }
}