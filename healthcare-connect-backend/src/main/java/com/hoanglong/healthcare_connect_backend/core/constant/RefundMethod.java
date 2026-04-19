package com.hoanglong.healthcare_connect_backend.core.constant;

public enum RefundMethod {
    MOMO("Hoàn qua ví MoMo"),
    CASH("Hoàn tiền mặt"),
    BANK_TRANSFER("Hoàn qua chuyển khoản"),
    VNPAY("Hoàn qua VNPay"),
    WALLET("Hoàn vào ví nội bộ");

    private final String displayName;

    RefundMethod(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}