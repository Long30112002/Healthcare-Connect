package com.hoanglong.healthcare_connect_backend.core.constant;

public enum PaymentMethod {
    CASH("Tiền mặt", false),           // Không cần provider
    MOMO("Ví MoMo", true),             // Cần provider
    VNPAY("VNPay", true),              // Cần provider (sau này)
    BANK_TRANSFER("Chuyển khoản", true), // Cần provider (sau này)
    CREDIT_CARD("Thẻ tín dụng", true),   // Cần provider (sau này)
    ;

    private final String displayName;
    private final boolean needProvider;

    PaymentMethod(String displayName, boolean needProvider) {
        this.displayName = displayName;
        this.needProvider = needProvider;
    }

    public String getDisplayName() {
        return displayName;
    }

    public boolean isNeedProvider() {
        return needProvider;
    }
}