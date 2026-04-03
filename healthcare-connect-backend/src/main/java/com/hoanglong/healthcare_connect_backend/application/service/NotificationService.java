package com.hoanglong.healthcare_connect_backend.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Gửi thông báo realtime tới một topic cụ thể
     * @param topic Đường dẫn topic (VD: /topic/payment/abc-123)
     * @param payload Dữ liệu muốn gửi (Object, Map, String...)
     */
    public void sendRealtimeNotification(String topic, Object payload) {
        try {
            messagingTemplate.convertAndSend(topic, payload);
            log.info("==> [SOCKET] Đã phát tín hiệu tới {}: {}", topic, payload);
        } catch (Exception e) {
            log.error("==> [SOCKET ERROR] Không thể gửi tín hiệu: {}", e.getMessage());
        }
    }
}