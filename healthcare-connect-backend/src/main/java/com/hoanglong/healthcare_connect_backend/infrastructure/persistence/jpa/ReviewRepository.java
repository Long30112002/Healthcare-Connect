package com.hoanglong.healthcare_connect_backend.infrastructure.persistence.jpa;

import com.hoanglong.healthcare_connect_backend.core.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    @Query("SELECT r FROM Review r WHERE r.appointment.id = :appointmentId AND r.deleted = false")
    Optional<Review> findByAppointmentId(@Param("appointmentId") UUID appointmentId);

    @Query("SELECT r.doctor.id, AVG(r.rating) FROM Review r " +
            "WHERE r.doctor.id IN :doctorIds AND r.deleted = false " +
            "GROUP BY r.doctor.id")
    List<Object[]> getAverageRatingsByDoctorIds(@Param("doctorIds") List<UUID> doctorIds);

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM Review r " +
            "WHERE r.appointment.id = :appointmentId AND r.deleted = false")
    boolean existsByAppointmentId(@Param("appointmentId") UUID appointmentId);

    @Query("SELECT r FROM Review r WHERE r.doctor.id = :doctorId AND r.deleted = false")
    Page<Review> findByDoctorId(@Param("doctorId") UUID doctorId, Pageable pageable);

    @Query("SELECT r FROM Review r WHERE r.doctor.id = :doctorId AND r.deleted = false")
    List<Review> findAllByDoctorId(@Param("doctorId") UUID doctorId);

    @Query("SELECT r FROM Review r WHERE r.patient.id = :patientId AND r.deleted = false " +
            "ORDER BY r.createdAt DESC")
    List<Review> findByPatientIdOrderByCreatedAtDesc(@Param("patientId") UUID patientId);

    @Query("SELECT r FROM Review r WHERE r.doctor.id = :doctorId AND r.deleted = false " +
            "ORDER BY r.createdAt DESC")
    List<Review> findTop5ByDoctorIdOrderByCreatedAtDesc(@Param("doctorId") UUID doctorId, Pageable pageable);

    @Query("SELECT r FROM Review r WHERE r.doctor.id = :doctorId AND r.deleted = false " +
            "AND r.createdAt BETWEEN :start AND :end")
    List<Review> findByDoctorIdAndCreatedAtBetween(@Param("doctorId") UUID doctorId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query(value = "SELECT AVG(rating) FROM reviews WHERE doctor_id = :doctorId AND deleted = false",
            nativeQuery = true)
    Double getAverageRatingByDoctorId(@Param("doctorId") UUID doctorId);

    @Query(value = "SELECT rating, COUNT(*) FROM reviews WHERE doctor_id = :doctorId AND deleted = false " +
            "GROUP BY rating", nativeQuery = true)
    List<Object[]> getRatingCountByDoctorId(@Param("doctorId") UUID doctorId);

    @Modifying
    @Query("UPDATE Review r SET r.deleted = true WHERE r.id = :id")
    void softDeleteById(@Param("id") UUID id);
}