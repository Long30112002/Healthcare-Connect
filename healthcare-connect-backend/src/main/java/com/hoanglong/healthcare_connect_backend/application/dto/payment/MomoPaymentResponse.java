package com.hoanglong.healthcare_connect_backend.application.dto.payment;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MomoPaymentResponse {
    private String payUrl;
    private String qrCodeUrl;
    private String deeplink;
}