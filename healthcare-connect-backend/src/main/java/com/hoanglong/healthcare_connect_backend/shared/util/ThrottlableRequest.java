package com.hoanglong.healthcare_connect_backend.shared.util;

public interface ThrottlableRequest {
    // Trả về email, số điện thoại hoặc bất cứ thứ gì muốn dùng làm Key để chặn
    String getThrottleKey();
}
