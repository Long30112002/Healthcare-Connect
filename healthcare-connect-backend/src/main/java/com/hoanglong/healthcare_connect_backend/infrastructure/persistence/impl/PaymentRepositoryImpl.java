package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.impl;

import com.hoanglong.healthcare_connect_backend.core.entity.Payment;
import com.hoanglong.healthcare_connect_backend.core.repository.IPaymentRepository;
import com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa.JpaPaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class PaymentRepositoryImpl implements IPaymentRepository
{
    private final JpaPaymentRepository jpaPaymentRepository;

    @Override
    public Payment save(Payment payment) {
        return jpaPaymentRepository.save(payment);
    }

}