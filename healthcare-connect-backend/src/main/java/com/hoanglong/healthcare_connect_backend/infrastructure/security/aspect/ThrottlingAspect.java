package com.hoanglong.healthcare_connect_backend.infrastructure.security.aspect;

import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.shared.annotation.Throttling;
import com.hoanglong.healthcare_connect_backend.shared.util.ThrottlableRequest;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Aspect
@Component
@Slf4j
public class ThrottlingAspect {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Around("@annotation(throttling)")
    public Object throttle(ProceedingJoinPoint pjp, Throttling throttling) throws Throwable {
        String methodName = pjp.getSignature().getName();

        // Gọi hàm thông minh ở trên
        String identifier = determineRequestKey(pjp);

        // Composite Key: Ví dụ "REQ_long@gmail.com_login" hoặc "IP_127.0.0.1_register"
        String compositeKey = identifier + "_" + methodName;

        Bucket bucket = buckets.computeIfAbsent(compositeKey, k -> Bucket.builder()
                .addLimit(Bandwidth.classic(throttling.limit(),
                        Refill.intervally(throttling.limit(), Duration.ofSeconds(throttling.duration()))))
                .build());

        if (bucket.tryConsume(1)) {
            return pjp.proceed();
        } else {
            log.warn("Rate limit exceeded: {} - {}", identifier, methodName);
            throw new AppException(ErrorCode.TOO_MANY_REQUESTS);
        }
    }

    private String determineRequestKey(ProceedingJoinPoint pjp) {
        // 1. Lấy IP làm mặc định (Luôn có)
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        String clientIp = request.getRemoteAddr();

        // 2. Kiểm tra xem tham số truyền vào có "đánh dấu" ThrottlableRequest không
        Object[] args = pjp.getArgs();
        for (Object arg : args) {
            if (arg instanceof ThrottlableRequest throttlable) {
                // Nếu có, ưu tiên dùng Key tự khai báo (ví dụ Email)
                return "REQ_" + throttlable.getThrottleKey();
            }
        }

        // 3. Nếu không có DTO nào đánh dấu, quay về dùng IP cho an toàn
        return "IP_" + clientIp;
    }
}