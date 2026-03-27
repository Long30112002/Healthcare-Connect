package com.hoanglong.healthcare_connect_backend.infrastructure.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

import javax.crypto.spec.SecretKeySpec;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Giúp Long dùng được @PreAuthorize("hasRole('ADMIN')") ở Controller
public class SecurityConfig {

    @Value("${jwt.signerKey}")
    private String signerKey;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable);

        http.authorizeHttpRequests(request -> request
                // 1. Các API xác thực (Login/Register) - Luôn luôn mở
                .requestMatchers(HttpMethod.POST, "/api/auth/**", "/api/users").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/auth/verify").permitAll()

                // 2. CẤU HÌNH CHO DEPARTMENTS & SPECIALTIES
                // Cho phép xem (GET) tự do - Viết cụ thể URL
                .requestMatchers(HttpMethod.GET, "/api/departments", "/api/departments/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/specialties", "/api/specialties/**").permitAll()

                // Chỉ ADMIN mới được tác động (POST/PUT/DELETE)
                .requestMatchers("/api/departments/**", "/api/specialties/**").hasRole("ADMIN")

                // 3. Tất cả các API còn lại phải ĐĂNG NHẬP
                .anyRequest().authenticated()
        );

        http.oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                        .decoder(jwtDecoder())
                        .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
                .authenticationEntryPoint(new JwtAuthenticationEntryPoint())
        );

        return http.build();
    }
    // Các Bean jwtDecoder và jwtAuthenticationConverter giữ nguyên như code của bạn là chuẩn rồi!
    @Bean
    JwtDecoder jwtDecoder() {
        SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS256");
        return NimbusJwtDecoder.withSecretKey(secretKeySpec)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        grantedAuthoritiesConverter.setAuthorityPrefix("ROLE_"); // Thêm ROLE_ để khớp với hasRole("ADMIN")
        grantedAuthoritiesConverter.setAuthoritiesClaimName("role");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        return jwtAuthenticationConverter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}