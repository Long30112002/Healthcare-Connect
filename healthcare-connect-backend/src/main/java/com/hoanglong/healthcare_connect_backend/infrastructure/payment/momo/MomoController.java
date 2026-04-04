package com.hoanglong.healthcare_connect_backend.infrastructure.payment.momo;

import com.hoanglong.healthcare_connect_backend.api.payload.ApiResponse;
import com.hoanglong.healthcare_connect_backend.application.usecase.CreatePaymentUseCase;
import com.hoanglong.healthcare_connect_backend.infrastructure.messaging.payment.PaymentProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments/momo")
@RequiredArgsConstructor
@Slf4j
public class MomoController {

    private final CreatePaymentUseCase createPaymentUseCase;
    private final PaymentProvider paymentProvider;

    // 1. API CHÍNH: Người dùng nhấn nút "Thanh toán" ở Frontend sẽ gọi vào đây
    @PostMapping("/create-payment/{appointmentId}")
    public ResponseEntity<ApiResponse<String>> createPayment(@PathVariable UUID appointmentId) {
        log.info("==> [MOMO] Yêu cầu tạo link thanh toán cho Appointment: {}", appointmentId);

        String payUrl = createPaymentUseCase.execute(appointmentId);

        return ResponseEntity.ok(ApiResponse.<String>builder()
                .data(payUrl)
                .build());
    }

    // 2. RETURN URL
    @GetMapping("/callback")
    public ResponseEntity<String> handleMomoCallback(@RequestParam Map<String, String> params) {
        log.info("==> [MOMO] User quay lại từ trang thanh toán: {}", params);
        return ResponseEntity.ok("Cảm ơn bạn, hệ thống đang xử lý giao dịch. Vui lòng kiểm tra trạng thái lịch hẹn.");
    }

    // 3. IPN URL
    // @PostMapping("/ipn")
    @PostMapping(value = "/ipn", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> handleMomoIPN(@RequestBody Map<String, String> body) {
        log.info("==> [MOMO] Nhận thông báo IPN từ Server MoMo: {}", body);
        paymentProvider.processIPN(body);
        return ResponseEntity.noContent().build();
    }
}