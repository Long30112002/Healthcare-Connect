package com.hoanglong.healthcare_connect_backend.infrastructure.messaging.payment;

import com.hoanglong.healthcare_connect_backend.core.constant.PaymentMethod;
import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;
import com.hoanglong.healthcare_connect_backend.core.entity.Payment;
import org.cloudinary.json.JSONObject;

import java.util.Map;

public interface PaymentProvider
{
    String createPaymentRequest(Appointment appointment);
    void processIPN(Map<String, String> body);
    PaymentMethod getSupportedMethod();
    default JSONObject refundTransaction(Payment payment, long amount, String description) {
        throw new UnsupportedOperationException("Refund not supported for this payment provider");
    }
}
