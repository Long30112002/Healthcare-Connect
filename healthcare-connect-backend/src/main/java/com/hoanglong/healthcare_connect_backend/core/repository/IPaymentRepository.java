package com.hoanglong.healthcare_connect_backend.core.repository;

import com.hoanglong.healthcare_connect_backend.core.entity.Payment;

import java.util.Optional;
import java.util.UUID;

public interface IPaymentRepository {
    Payment save(Payment payment);

    Optional<Payment> findByAppointmentId(UUID appointmentId);

    boolean existsByTransactionNo(String transId);
}