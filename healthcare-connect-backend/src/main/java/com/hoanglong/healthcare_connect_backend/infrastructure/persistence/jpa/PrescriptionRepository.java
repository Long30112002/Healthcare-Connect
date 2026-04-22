package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;

import com.hoanglong.healthcare_connect_backend.core.constant.PrescriptionStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, UUID>
{

    // Tìm theo medical record
    List<Prescription> findByMedicalRecordId(UUID medicalRecordId);

    Page<Prescription> findByMedicalRecordId(UUID medicalRecordId, Pageable pageable);

    // Tìm theo patient (thông qua medical record)
    @Query("SELECT p FROM Prescription p " +
            "WHERE p.medicalRecord.patient.id = :patientId " +
            "AND p.medicalRecord.deleted = false " +
            "ORDER BY p.prescriptionDate DESC")
    Page<Prescription> findByPatientId(@Param("patientId") UUID patientId, Pageable pageable);

    // Tìm đơn thuốc còn hiệu lực
    @Query("SELECT p FROM Prescription p " +
            "WHERE p.status = :status " +
            "AND (p.validUntil IS NULL OR p.validUntil >= CURRENT_DATE) " +
            "AND p.medicalRecord.patient.id = :patientId")
    List<Prescription> findValidPrescriptionsByPatientId(
            @Param("patientId") UUID patientId,
            @Param("status") PrescriptionStatus status
    );

    // Tìm đơn thuốc sắp hết hạn
    @Query("SELECT p FROM Prescription p " +
            "WHERE p.status = :status " +
            "AND p.validUntil BETWEEN :startDate AND :endDate")
    List<Prescription> findExpiringSoon(
            @Param("status") PrescriptionStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // Cập nhật status khi hết hạn
    @Modifying
    @Transactional
    @Query("UPDATE Prescription p SET p.status = :newStatus " +
            "WHERE p.status = :oldStatus AND p.validUntil < CURRENT_DATE")
    int updateExpiredPrescriptions(
            @Param("oldStatus") PrescriptionStatus oldStatus,
            @Param("newStatus") PrescriptionStatus newStatus
    );

    // Thống kê tổng tiền đơn thuốc theo bác sĩ
    @Query("SELECT p.medicalRecord.doctor.id, SUM(p.totalAmount) " +
            "FROM Prescription p " +
            "WHERE p.medicalRecord.hospital.id = :hospitalId " +
            "AND p.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY p.medicalRecord.doctor.id")
    List<Object[]> getTotalAmountByDoctor(
            @Param("hospitalId") UUID hospitalId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}