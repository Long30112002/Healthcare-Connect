package com.hoanglong.healthcare_connect_backend.application.dto.auth;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hoanglong.healthcare_connect_backend.application.dto.user.UserResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LoginResponse {
    String accessToken;
    String refreshToken;
    boolean authenticated;
    UserResponse user;
}