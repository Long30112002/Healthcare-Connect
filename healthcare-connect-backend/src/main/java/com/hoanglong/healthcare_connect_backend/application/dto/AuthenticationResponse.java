package com.hoanglong.healthcare_connect_backend.application.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL) // Những trường null sẽ không hiện trong JSON
public class AuthenticationResponse {
    private String token;           // JWT Token trả về khi login thành công
    private boolean authenticated;  // Trạng thái xác thực (true/false)
    private UserResponse user;
}
