package com.hoanglong.healthcare_connect_backend.infrastructure.payment;

import com.hoanglong.healthcare_connect_backend.core.constant.PaymentMethod;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.infrastructure.messaging.payment.PaymentProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PaymentProviderFactory {

    private final List<PaymentProvider> providers;  // Spring tự inject tất cả PaymentProvider beans

    public PaymentProvider getProvider(PaymentMethod method) {
        return providers.stream()
                .filter(provider -> provider.getSupportedMethod() == method)
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.UNSUPPORTED_PAYMENT_METHOD));
    }

    public boolean isSupported(PaymentMethod method) {
        return providers.stream()
                .anyMatch(provider -> provider.getSupportedMethod() == method);
    }
}