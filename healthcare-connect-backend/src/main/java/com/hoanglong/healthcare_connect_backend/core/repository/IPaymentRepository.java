package com.hoanglong.healthcare_connect_backend.core.repository;

import com.hoanglong.healthcare_connect_backend.core.entity.Payment;

import java.util.Optional;

public interface IPaymentRepository {
    Payment save(Payment payment);
}