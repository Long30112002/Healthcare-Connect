package com.hoanglong.healthcare_connect_backend.core.entity;

import com.hoanglong.healthcare_connect_backend.core.constant.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Builder
@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @OneToOne // Tốt hơn là dùng mapping thay vì chỉ lưu UUID
    @JoinColumn(name = "appointment_id")
    Appointment appointment; // Liên kết với lịch khám

    String paymentMethod; // "MOMO" hoặc "VNPAY"
    String transactionNo; // Mã giao dịch từ phía MoMo/VNPay trả về

    @Enumerated(EnumType.STRING)
    PaymentStatus status; // PENDING, SUCCESS, FAILED, REFUNDED

    @Builder.Default
    LocalDateTime createdAt = LocalDateTime.now();

    @Column(precision = 19, scale = 2)
    BigDecimal amount;

    @Column(precision = 19, scale = 2)
    BigDecimal refundAmount;
}