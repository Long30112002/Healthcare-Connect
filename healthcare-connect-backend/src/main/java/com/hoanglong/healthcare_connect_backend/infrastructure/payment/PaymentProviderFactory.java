package com.hoanglong.healthcare_connect_backend.infrastructure.payment.momo;

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

    private final Map<PaymentMethod, PaymentProvider> providerMap;

    // Spring sẽ tự inject tất cả PaymentProvider beans vào constructor
    public PaymentProviderFactory(List<PaymentProvider> providers) {
        this.providerMap = providers.stream()
                .collect(Collectors.toMap(
                        provider -> provider.getSupportedMethod(),
                        Function.identity()
                ));
    }

    public PaymentProvider getProvider(PaymentMethod method) {
        PaymentProvider provider = providerMap.get(method);
        if (provider == null) {
            throw new AppException(ErrorCode.UNSUPPORTED_PAYMENT_METHOD);
        }
        return provider;
    }

    public boolean isSupported(PaymentMethod method) {
        return providerMap.containsKey(method);
    }
}