package com.hoanglong.healthcare_connect_backend.core.entity;

import com.hoanglong.healthcare_connect_backend.core.constant.DoctorStatus;
import com.hoanglong.healthcare_connect_backend.core.constant.RejectionReason;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "doctors")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(unique = true, nullable = false)
    String doctorCode; // Mã số bác sĩ (Dùng để hiển thị/tra cứu)

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    User user;

    @ManyToOne
    @JoinColumn(name = "specialty_id")
    Specialty specialty;

    @ManyToOne
    @JoinColumn(name = "department_id")
    Department department;

    String degree; // Học vị
    String experience; // Mô tả kinh nghiệm
    BigDecimal consultationFee; // Phí khám

    @Enumerated(EnumType.STRING)
    DoctorStatus status; // PENDING, APPROVED, REJECTED

    @Enumerated(EnumType.STRING) // Lưu dưới dạng chữ (VD: 'INVALID_DEGREE')
    RejectionReason rejectionReason;

    // Nếu chọn "Lý do khác", có thể thêm cột này để ghi chú thêm (Optional)
    private String rejectionNote;
}