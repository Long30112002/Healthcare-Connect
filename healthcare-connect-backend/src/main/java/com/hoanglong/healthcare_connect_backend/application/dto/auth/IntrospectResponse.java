package com.hoanglong.healthcare_connect_backend.application.dto.auth;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class IntrospectResponse {
    boolean valid; // Trả về true nếu token còn dùng được, false nếu không
}