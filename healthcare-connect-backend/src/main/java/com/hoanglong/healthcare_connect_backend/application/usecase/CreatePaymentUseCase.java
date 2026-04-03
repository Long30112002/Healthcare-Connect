package com.hoanglong.healthcare_connect_backend.application.usecase;

import com.hoanglong.healthcare_connect_backend.core.entity.Appointment;
import com.hoanglong.healthcare_connect_backend.core.exception.AppException;
import com.hoanglong.healthcare_connect_backend.core.exception.ErrorCode;
import com.hoanglong.healthcare_connect_backend.core.payment.PaymentProvider;
import com.hoanglong.healthcare_connect_backend.core.repository.IAppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CreatePaymentUseCase {

    private final IAppointmentRepository appointmentRepository;
    private final PaymentProvider paymentProvider; // Chính là Interface MoMo/VNPay

    public String execute(UUID appointmentId) {
        // 1. Tìm Appointment
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn"));

        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!appointment.getPatient().getId().toString().equals(currentUserId)) {
            System.out.println("Error");
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // 2. Kiểm tra nếu đã thanh toán rồi thì không tạo link nữa
        if (appointment.isPaid()) {
            throw new RuntimeException("Lịch hẹn này đã được thanh toán!");
        }

        // 3. Gọi Provider (MoMo) để lấy URL
        return paymentProvider.createPaymentRequest(appointment);
    }
}