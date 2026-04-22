package com.hoanglong.healthcare_connect_backend.application.dto.auth;

import com.hoanglong.healthcare_connect_backend.shared.util.ThrottlableRequest;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LoginRequest implements ThrottlableRequest
{
    String email;
    String password;

    @Override
    public String getThrottleKey() {
        return this.email; // Muốn chặn theo Email khi Login spam
    }
}