package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;

import com.hoanglong.healthcare_connect_backend.core.constant.MedicalRecordStatus;
import com.hoanglong.healthcare_connect_backend.core.entity.MedicalRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, UUID>
{

    // Tìm theo appointment
    Optional<MedicalRecord> findByAppointmentId(UUID appointmentId);

    boolean existsByAppointmentId(UUID appointmentId);

    // Tìm theo patient
    Page<MedicalRecord> findByPatientIdAndDeletedFalse(UUID patientId, Pageable pageable);

    List<MedicalRecord> findByPatientIdAndDeletedFalseOrderByCreatedAtDesc(UUID patientId);

    // Tìm theo doctor
    Page<MedicalRecord> findByDoctorIdAndDeletedFalse(UUID doctorId, Pageable pageable);

    List<MedicalRecord> findByDoctorIdAndDeletedFalseOrderByCreatedAtDesc(UUID doctorId);

    // Tìm theo hospital
    Page<MedicalRecord> findByHospitalIdAndDeletedFalse(UUID hospitalId, Pageable pageable);

    // Tìm theo status
    Page<MedicalRecord> findByStatusAndDeletedFalse(MedicalRecordStatus status, Pageable pageable);

    // Tìm theo follow-up date
    List<MedicalRecord> findByFollowUpDateAndDeletedFalse(LocalDate followUpDate);

    List<MedicalRecord> findByFollowUpDateBeforeAndStatusAndDeletedFalse(
            LocalDate date,
            MedicalRecordStatus status
    );

    // Search với keyword
    @Query("SELECT m FROM MedicalRecord m WHERE m.deleted = false AND " +
            "(LOWER(m.diagnosis) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.symptoms) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.patient.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<MedicalRecord> search(@Param("keyword") String keyword, Pageable pageable);

    // Thống kê số lượng bệnh án theo bác sĩ
    @Query("SELECT m.doctor.id, COUNT(m) FROM MedicalRecord m " +
            "WHERE m.hospital.id = :hospitalId AND m.deleted = false " +
            "GROUP BY m.doctor.id")
    List<Object[]> countByDoctor(@Param("hospitalId") UUID hospitalId);

    // Thống kê số lượng bệnh án theo tháng
    @Query("SELECT FUNCTION('YEAR', m.createdAt), FUNCTION('MONTH', m.createdAt), COUNT(m) " +
            "FROM MedicalRecord m " +
            "WHERE m.hospital.id = :hospitalId AND m.deleted = false " +
            "AND m.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY FUNCTION('YEAR', m.createdAt), FUNCTION('MONTH', m.createdAt)")
    List<Object[]> countByMonth(@Param("hospitalId") UUID hospitalId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Soft delete
    @Modifying
    @Transactional
    @Query("UPDATE MedicalRecord m SET m.deleted = true, m.deletedAt = CURRENT_TIMESTAMP, " +
            "m.status = com.hoanglong.healthcare_connect_backend.core.constant.MedicalRecordStatus.ARCHIVED " +
            "WHERE m.id = :id")
    void softDeleteById(@Param("id") UUID id);

    // Tìm cả deleted (cho admin)
    @Query("SELECT m FROM MedicalRecord m WHERE m.id = :id")
    Optional<MedicalRecord> findByIdIncludingDeleted(@Param("id") UUID id);

    @Query("SELECT m.diagnosis, COUNT(m.id) as count " +
            "FROM MedicalRecord m " +
            "WHERE m.doctor.id = :doctorId " +
            "AND m.deleted = false " +
            "AND m.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY m.diagnosis " +
            "ORDER BY count DESC")
    List<Object[]> getTopDiagnosesByDoctorIdAndDateRange(@Param("doctorId") UUID doctorId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}