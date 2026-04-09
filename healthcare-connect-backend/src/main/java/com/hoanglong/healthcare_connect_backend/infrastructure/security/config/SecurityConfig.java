package com.hoanglong.healthcare_connect_backend.infrastructure.security.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.service.AuthenticationService;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import jakarta.servlet.Filter;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.util.StringUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.spec.SecretKeySpec;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    @Value("${jwt.signerKey}")
    private String signerKey;

    @Autowired
    @Lazy
    private AuthenticationService authenticationService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${app.frontend.url.host}")
    private String frontendLan;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf
                .ignoringRequestMatchers("/api/**", "/ws/**")
                .disable()
        );

//        http.cors(Customizer.withDefaults());
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));

        http.authorizeHttpRequests(request -> request
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/**", "/api/users").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/auth/verify").permitAll()
                .requestMatchers("/api/payments/momo/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/departments/**", "/api/specialties/**").permitAll()
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/doctors/apply").hasAnyRole("PATIENT", "USER")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/departments/**").hasRole("ADMIN")
                .anyRequest().authenticated()
        );

        http.exceptionHandling(exception -> exception
                .authenticationEntryPoint(new JwtAuthenticationEntryPoint())
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    // Xử lý 403 - FORBIDDEN
                    ErrorCode errorCode = ErrorCode.FORBIDDEN;
                    response.setStatus(errorCode.getStatusCode().value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setCharacterEncoding("UTF-8");

                    ApiResponse<Object> apiResponse = ApiResponse.builder()
                            .status("error")
                            .code(errorCode.getCode())
                            .message(errorCode.getMessage())
                            .build();

                    ObjectMapper mapper = new ObjectMapper();
                    response.getWriter().write(mapper.writeValueAsString(apiResponse));
                })
        );

        http.oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                        .decoder(jwtDecoder())
                        .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
                .bearerTokenResolver(request -> {
                    // 1. Kiểm tra trong Cookie trước
                    Cookie[] cookies = request.getCookies();
                    if (cookies != null) {
                        for (Cookie cookie : cookies) {
                            if ("accessToken".equals(cookie.getName())) {
                                return cookie.getValue();
                            }
                        }
                    }
                    // 2. Nếu không có Cookie thì lấy từ Header
                    String header = request.getHeader(HttpHeaders.AUTHORIZATION);
                    if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
                        return header.substring(7);
                    }
                    return null;
                })
                .authenticationEntryPoint(new JwtAuthenticationEntryPoint())
        );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 1. Cho phép nguồn từ Frontend của bạn
        configuration.setAllowedOrigins(List.of(frontendUrl, frontendLan));

        // 2. Cho phép các phương thức HTTP phổ biến
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // 3. Cho phép các Header quan trọng để gửi JWT và JSON
        configuration.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Cache-Control",
                "X-Requested-With"
        ));

        // 4. Cho phép gửi kèm Credentials
        configuration.setAllowCredentials(true);

        // 5. Cache kết quả Preflight trong 1 tiếng để tăng tốc độ cho Frontend
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Áp dụng cho tất cả các API (/api/**, /ws/**, ...)
        return source;
    }

    @Bean
    JwtDecoder jwtDecoder() {
        SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS256");
        NimbusJwtDecoder nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();

        nimbusJwtDecoder.setJwtValidator(token -> {
            try {
                authenticationService.verifyToken(token.getTokenValue());
                return OAuth2TokenValidatorResult.success();
            } catch (Exception e) {
                return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", e.getMessage(), null));
            }
        });
        return token -> {
            try {
                return nimbusJwtDecoder.decode(token);
            } catch (Exception e) {
                throw new JwtException(e.getMessage());
            }
        };
    }

    @Bean
    public Filter corsFilter() {
        return (request, response, chain) -> {
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            httpResponse.setHeader("Access-Control-Allow-Origin", frontendUrl);
            httpResponse.setHeader("Access-Control-Allow-Credentials", "true");
            httpResponse.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
            httpResponse.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
            chain.doFilter(request, response);
        };
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        grantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");
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