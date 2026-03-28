package com.hoanglong.healthcare_connect_backend.shared.util;

import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.UUID;

public class SecurityUtils {

    // Không cho phép khởi tạo đối tượng bằng từ khóa new
    private SecurityUtils() {}

    public static UUID getCurrentUserId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        try {
            // Lấy subject (là ID) từ Token
            return UUID.fromString(authentication.getName());
        } catch (IllegalArgumentException e) {
            // Lỗi này xảy ra nếu subject trong Token không phải là định dạng UUID
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
    }
}