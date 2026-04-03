package com.hoanglong.healthcare_connect_backend.core.payment;

import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;

import java.util.Map;

public interface PaymentProvider
{
    String createPaymentRequest(Appointment appointment);
    void processIPN(Map<String, String> body);
}
