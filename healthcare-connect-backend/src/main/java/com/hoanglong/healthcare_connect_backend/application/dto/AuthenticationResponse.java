package com.hoanglong.healthcare_connect_backend.application.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL) // Những trường null sẽ không hiện trong JSON
public class AuthenticationResponse {
    String token;           // JWT Token trả về khi login thành công
    boolean authenticated;  // Trạng thái xác thực (true/false)
    UserResponse user;
}
